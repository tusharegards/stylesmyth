import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, ImagePlus, LoaderCircle, Send, Sparkles, Store, WandSparkles, X } from 'lucide-react'
import { retailerCategories } from '../data/marketplace.js'

const creativeDirections = [
  { label: 'Campaign', prompt: 'Create a luxury fashion campaign image with a dramatic studio backdrop.' },
  { label: 'On model', prompt: 'Show the garment styled naturally on a fashion model in a premium editorial setting.' },
  { label: 'Lookbook', prompt: 'Create a refined boutique lookbook image with a clean, minimal background.' },
]

function DialogHeader({ icon = 'stylist', eyebrow, title, onClose, titleId }) {
  return (
    <div className="dialog-head">
      <div className={icon === 'store' ? 'store-avatar' : 'ai-avatar'}>
        {icon === 'store' ? <Store size={18} aria-hidden="true" /> : <WandSparkles size={18} aria-hidden="true" />}
      </div>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
      </div>
      <button className="close-button" onClick={onClose} aria-label="Close dialog"><X aria-hidden="true" /></button>
    </div>
  )
}

function Overlay({ children, onClose, labelledBy, className = '' }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return (
    <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className={`dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </section>
    </div>
  )
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error(`Could not read ${file.name}. Please choose it again.`))
    reader.readAsDataURL(file)
  })
}

export function StylistDialog({ onClose }) {
  const [prompt, setPrompt] = useState('')
  const [garments, setGarments] = useState([])
  const [messages, setMessages] = useState([])
  const [resultImage, setResultImage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => () => garments.forEach((garment) => URL.revokeObjectURL(garment.preview)), [garments])

  const chooseGarments = (event) => {
    const chosen = Array.from(event.target.files || [])
    event.target.value = ''
    if (!chosen.length) return

    const supported = chosen.filter((file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
    const tooLarge = supported.find((file) => file.size > 5 * 1024 * 1024)
    if (supported.length !== chosen.length) {
      setError('Choose PNG, JPG, or WebP clothing photos.')
      return
    }
    if (tooLarge) {
      setError('Each photo needs to be under 5 MB.')
      return
    }
    setError('')
    setGarments((current) => [...current, ...supported].slice(0, 2).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    })))
  }

  const removeGarment = (preview) => setGarments((current) => current.filter((garment) => garment.preview !== preview))

  const generateImage = async (event) => {
    event.preventDefault()
    const brief = prompt.trim()
    if (!garments.length) {
      setError('Add at least one clothing photo to begin.')
      return
    }
    if (!brief) {
      setError('Tell your stylist what kind of image you would like to create.')
      return
    }

    setError('')
    setIsGenerating(true)
    try {
      const images = await Promise.all(garments.map(async ({ file }) => ({ name: file.name, dataUrl: await readAsDataUrl(file) })))
      const response = await fetch('/api/stylist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, prompt: brief }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'The image could not be created. Please try again.')

      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-user`, role: 'you', text: brief, images: garments.map(({ preview }) => preview) },
        { id: `${Date.now()}-stylist`, role: 'stylist', text: 'Your piece is on the runway. I’ve created a campaign image from your brief.' },
      ])
      setResultImage(payload.image)
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Overlay onClose={onClose} labelledBy="stylist-title" className="atelier-dialog">
      <div className="atelier-dialog-head">
        <DialogHeader
          eyebrow="STYLEMYTH · AI ATELIER"
          title="Your idea, in a new light."
          titleId="stylist-title"
          onClose={onClose}
        />
        <p>Upload a clothing piece, describe the scene, and create an editorial image around your garment.</p>
      </div>

      <div className="atelier-workspace">
        <div className="atelier-chat-column">
          <div className="conversation atelier-conversation" aria-live="polite">
            {messages.length === 0 ? (
              <div className="atelier-welcome">
                <span className="chat-orb"><Sparkles size={18} aria-hidden="true" /></span>
                <p className="eyebrow">YOUR CREATIVE PARTNER</p>
                <h3>Let’s make the piece the story.</h3>
                <p>Add a clear photo of the clothing item. Then tell me the mood, setting, or campaign style you have in mind.</p>
                <div className="welcome-example">“A sculptural evening look in a warm, candlelit atelier.”</div>
              </div>
            ) : messages.map((message) => (
              <div className="atelier-message-group" key={message.id}>
                <div className={`atelier-message ${message.role === 'you' ? 'from-user' : 'from-stylist'}`}>
                  <span>{message.role === 'you' ? 'YOUR CREATIVE BRIEF' : 'STYLEMYTH STYLIST'}</span>
                  <p>{message.text}</p>
                  {message.images && <div className="message-thumbnails">{message.images.map((image, index) => <img key={`${message.id}-${index}`} src={image} alt="Uploaded garment reference" />)}</div>}
                </div>
              </div>
            ))}
            {isGenerating && <div className="rendering-note"><LoaderCircle size={16} className="spin" aria-hidden="true" /> The atelier is preparing your image…</div>}
          </div>

          <form className="atelier-prompt-form" onSubmit={generateImage}>
            <div className="garment-upload-list">
              {garments.map(({ file, preview }) => (
                <div className="garment-chip" key={preview}>
                  <img src={preview} alt="" />
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeGarment(preview)} aria-label={`Remove ${file.name}`}><X size={13} aria-hidden="true" /></button>
                </div>
              ))}
              {garments.length < 2 && (
                <label className="add-garment">
                  <ImagePlus size={16} aria-hidden="true" />
                  <span>{garments.length ? 'Add another piece' : 'Add clothing photo'}</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={chooseGarments} aria-label="Upload clothing photos" />
                </label>
              )}
            </div>
            <div className="creative-directions" aria-label="Creative direction suggestions">
              {creativeDirections.map((direction) => (
                <button type="button" key={direction.label} onClick={() => setPrompt(direction.prompt)}>{direction.label}</button>
              ))}
            </div>
            <label className="prompt-field">
              <span className="sr-only">Describe the campaign image you want</span>
              <textarea
                rows="3"
                maxLength={1200}
                placeholder="Describe the setting, mood, or styling you have in mind…"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
              />
            </label>
            {error && <p className="atelier-error" role="alert">{error}</p>}
            <div className="generate-row">
              <span><Sparkles size={12} aria-hidden="true" /> Your original garment guides the result</span>
              <button className="gold-button" disabled={isGenerating}>
                {isGenerating ? 'Creating…' : 'Create image'}
                {isGenerating ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <Send size={14} aria-hidden="true" />}
              </button>
            </div>
          </form>
        </div>

        <aside className="atelier-result" aria-label="Generated image preview">
          <div className="result-heading"><span>THE CAMPAIGN FRAME</span><span>01 / 01</span></div>
          {resultImage ? (
            <>
              <img className="result-image" src={resultImage} alt="AI-generated fashion campaign based on uploaded clothing" />
              <a className="download-result" href={resultImage} download="stylemyth-campaign.png">
                Download image <ArrowDownToLine size={15} aria-hidden="true" />
              </a>
            </>
          ) : (
            <div className="result-empty">
              <div className="result-threads" aria-hidden="true">✳</div>
              <p>Your next campaign<br /><em>starts with a piece.</em></p>
              <span>Upload an item and share your vision to create a new look.</span>
            </div>
          )}
          <p className="result-disclaimer">AI-created concept image. Review garment details before using in a product listing.</p>
        </aside>
      </div>
      <p className="atelier-footer-note">Images are generated through your configured AI provider and are not stored by this demo.</p>
    </Overlay>
  )
}

export function RetailerDialog({ onClose }) {
  const [submitted, setSubmitted] = useState(false)

  return (
    <Overlay onClose={onClose} labelledBy="retailer-title" className="publish-dialog">
      <DialogHeader icon="store" eyebrow="THE STYLEMYTH MARKETPLACE" title="Bring your label to life." titleId="retailer-title" onClose={onClose} />
      {submitted ? (
        <div className="publish-success">
          <span><Check size={25} aria-hidden="true" /></span>
          <h3>Your shopfront is taking shape.</h3>
          <p>This demo does not send applications yet. Connect a backend to receive retailer enquiries.</p>
          <button className="gold-button" onClick={onClose}>Close <ArrowUpRight size={15} aria-hidden="true" /></button>
        </div>
      ) : (
        <form className="publish-form" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }}>
          <p>Tell us about your label and we’ll help you set up an independent shopfront.</p>
          <label>Label name<input required name="label" placeholder="e.g. Studio Serein" /></label>
          <div className="form-row">
            <label>Your name<input required name="contactName" placeholder="Full name" /></label>
            <label>City<input required name="city" placeholder="Where are you based?" /></label>
          </div>
          <label>Email address<input required name="email" type="email" placeholder="you@yourlabel.com" /></label>
          <label>
            What do you make?
            <select name="category" defaultValue="" required>
              <option value="" disabled>Select a category</option>
              {retailerCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <button className="gold-button" type="submit">Request a shopfront <ArrowUpRight size={15} aria-hidden="true" /></button>
          <small>Independent labels, always welcome.</small>
          <p className="demo-note">Demo form. Connect a backend to collect retailer enquiries.</p>
        </form>
      )}
    </Overlay>
  )
}
