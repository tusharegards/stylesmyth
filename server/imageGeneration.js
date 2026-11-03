import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const MAX_IMAGES = 2
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_BODY_BYTES = 15 * 1024 * 1024
const MAX_PROMPT_LENGTH = 1200
const WINDOW_MS = 10 * 60 * 1000
const REQUESTS_PER_WINDOW = 5
const rateLimit = new Map()

function loadLocalEnvironment() {
  try {
    const source = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    for (const line of source.split(/\r?\n/)) {
      const entry = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!entry || process.env[entry[1]]) continue

      const value = entry[2].trim().replace(/^(['"])(.*)\1$/, '$2')
      process.env[entry[1]] = value
    }
  } catch {
    // Environment variables can also be provided by the hosting environment.
  }
}

loadLocalEnvironment()
const MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-sunburst'

function respond(response, statusCode, body) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

async function readJson(request) {
  const chunks = []
  let size = 0

  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw Object.assign(new Error('The upload is too large. Use images under 5 MB each.'), { status: 413 })
    chunks.push(chunk)
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('The request could not be read. Please try again.'), { status: 400 })
  }
}

function checkRateLimit(request) {
  const forwardedAddress = request.headers['x-forwarded-for']?.split(',')[0]?.trim()
  const key = forwardedAddress || request.socket?.remoteAddress || 'local'
  const now = Date.now()
  const recent = (rateLimit.get(key) || []).filter((timestamp) => now - timestamp < WINDOW_MS)

  if (recent.length >= REQUESTS_PER_WINDOW) return false
  rateLimit.set(key, [...recent, now])
  return true
}

function parseImage(image) {
  const match = typeof image?.dataUrl === 'string'
    ? image.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/)
    : null
  if (!match) throw Object.assign(new Error('Upload a PNG, JPG, or WebP garment image.'), { status: 400 })

  const bytes = Buffer.from(match[2], 'base64')
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error('Each garment image must be under 5 MB.'), { status: 400 })
  }

  const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[match[1]]
  const safeName = typeof image.name === 'string'
    ? image.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80)
    : `garment.${extension}`

  return { bytes, mimeType: match[1], name: safeName || `garment.${extension}` }
}

export async function handleImageGeneration(request, response) {
  if (request.method !== 'POST') return respond(response, 405, { error: 'Use POST to create an image.' })
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'replace-with-your-server-side-api-key') {
    return respond(response, 503, { error: 'Image generation is not configured yet. Add OPENAI_API_KEY to the project’s .env file and restart the server.' })
  }
  if (!checkRateLimit(request)) return respond(response, 429, { error: 'You’ve reached the preview limit. Please try again in a few minutes.' })

  try {
    const body = await readJson(request)
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const images = Array.isArray(body.images) ? body.images : []

    if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
      return respond(response, 400, { error: `Add a creative brief of up to ${MAX_PROMPT_LENGTH} characters.` })
    }
    if (images.length < 1 || images.length > MAX_IMAGES) {
      return respond(response, 400, { error: `Upload one or two clothing images to get started.` })
    }

    const form = new FormData()
    form.append('model', MODEL)
    form.append('size', '1536x1024')
    form.append('quality', 'high')
    form.append('prompt', [
      'Create a premium fashion campaign image using the uploaded garment reference image(s).',
      'Keep each referenced clothing article recognizable, preserving its core silhouette, color, material, pattern, and construction.',
      'Show the garment styled for an editorial fashion campaign. Make the result polished, realistic, and suitable for a boutique fashion brand.',
      'Do not add text, watermarks, or invented logos.',
      `Creative direction: ${prompt}`,
    ].join('\n'))

    for (const image of images) {
      const parsedImage = parseImage(image)
      form.append('image[]', new Blob([parsedImage.bytes], { type: parsedImage.mimeType }), parsedImage.name)
    }

    const upstream = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
      signal: AbortSignal.timeout(120_000),
    })
    const result = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      console.error('Image provider error:', upstream.status, result.error?.type || result.error?.code || 'unknown')
      return respond(response, upstream.status === 429 ? 429 : 502, {
        error: upstream.status === 429
          ? 'The image studio is busy right now. Please try again shortly.'
          : 'The image could not be created. Check your API setup and try again.',
      })
    }

    const imageData = result.data?.[0]?.b64_json
    if (!imageData) return respond(response, 502, { error: 'The image studio returned no image. Please try a different brief.' })
    return respond(response, 200, { image: `data:image/png;base64,${imageData}` })
  } catch (error) {
    if (error.status) return respond(response, error.status, { error: error.message })
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return respond(response, 504, { error: 'The render is taking longer than expected. Please try again.' })
    }
    console.error('Image generation error:', error.message)
    return respond(response, 500, { error: 'Something went wrong while creating your image.' })
  }
}
