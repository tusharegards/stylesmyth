import { createServer } from 'node:http'
import { handleImageGeneration } from './imageGeneration.js'

const port = Number(process.env.API_PORT || 3001)

createServer((request, response) => {
  const path = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname

  if (path === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ status: 'ok', imageGenerationConfigured: Boolean(process.env.OPENAI_API_KEY) }))
    return
  }

  if (path === '/api/stylist/generate') {
    void handleImageGeneration(request, response)
    return
  }

  response.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ error: 'Not found.' }))
}).listen(port, () => {
  console.log(`Stylemyth image API listening on http://localhost:${port}`)
})
