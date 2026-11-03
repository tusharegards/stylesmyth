import { useState } from 'react'
import { ArrowDown, ArrowRight, ImagePlus, MessageCircle, Sparkles, WandSparkles } from 'lucide-react'
import SiteFooter from './components/SiteFooter.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import MarketplaceSection from './components/MarketplaceSection.jsx'
import { RetailerDialog, StylistDialog } from './components/ExperienceDialogs.jsx'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDialog, setActiveDialog] = useState(null)

  const navigateTo = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <SiteHeader
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((isOpen) => !isOpen)}
        onNavigate={navigateTo}
        onOpenStylist={() => setActiveDialog('stylist')}
      />

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span /> THE AI FASHION ATELIER</p>
            <h1 id="hero-title">From garment<br />to <em>greatness.</em></h1>
            <p className="intro">Bring a clothing piece. Tell us the story. Create a fashion campaign with AI, made for your label and your point of view.</p>
            <div className="hero-actions">
              <button className="gold-button" onClick={() => setActiveDialog('stylist')}>
                Create with AI <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button className="quiet-link" onClick={() => navigateTo('retailers')}>
                For fashion businesses <ArrowDown size={15} aria-hidden="true" />
              </button>
            </div>
            <div className="hero-proof"><span className="proof-stars">✳ ✳ ✳</span><span>Real garments. New creative worlds.</span></div>
          </div>

          <div className="hero-visual" aria-label="Stylemyth fashion editorial">
            <div className="image-frame">
              <img
                src="/assets/hero-ai-atelier.png"
                alt="Fashion artisan in a black and gold atelier, tailoring a couture garment"
                fetchPriority="high"
              />
            </div>
            <div className="image-caption"><span>CRAFT MEETS IMAGINATION</span><span>ATELIER Nº 01</span></div>
            <div className="floating-note"><Sparkles size={15} aria-hidden="true" /><span>One piece.<br /><em>Infinite stories.</em></span></div>
            <div className="round-stamp" aria-hidden="true">DESIGNED<br />WITH AI<br />BY YOU</div>
          </div>
          <div className="hero-bottom"><span>Fashion imagery, made from the pieces you create</span><span>SCROLL TO EXPLORE ↓</span></div>
        </section>

        <section className="intro-strip" id="studio" aria-labelledby="intro-title">
          <div className="intro-label"><span className="line-mark" /> A NEW KIND OF FASHION WORKFLOW</div>
          <div className="intro-content">
            <h2 id="intro-title">Your pieces deserve<br /><em>a world of their own.</em></h2>
            <p>Stylemyth is a creative studio and discovery platform for independent fashion. Bring your actual clothing into the process, then direct the campaign you want to see.</p>
            <div className="process-steps">
              <article><span>01</span><h3>Bring the piece</h3><p>Upload a clear photo of a garment or accessory.</p></article>
              <article><span>02</span><h3>Set the direction</h3><p>Describe the mood, setting, and story.</p></article>
              <article><span>03</span><h3>Create the image</h3><p>Generate a fresh campaign concept to refine and share.</p></article>
            </div>
          </div>
        </section>

        <section className="stylist-band" aria-labelledby="stylist-section-title">
          <div className="stylist-copy">
            <p className="eyebrow"><span /> YOUR ON-DEMAND CREATIVE STUDIO</p>
            <h2 id="stylist-section-title">Make room for<br /><em>the unexpected.</em></h2>
            <p>Give your clothing a new setting, a new energy, and a new audience. The Stylemyth AI Atelier turns a garment photo and a creative brief into an original campaign concept.</p>
            <button className="gold-button" onClick={() => setActiveDialog('stylist')}>
              Open the AI Atelier <MessageCircle size={16} aria-hidden="true" />
            </button>
            <div className="stylist-chips" aria-label="Example creative directions">
              <span>Brand campaign</span><span>On-model editorial</span><span>Lookbook scene</span>
            </div>
          </div>

          <div className="chat-preview" aria-label="Stylemyth AI image creation preview">
            <div className="chat-top">
              <div className="ai-avatar"><WandSparkles size={18} aria-hidden="true" /></div>
              <div><strong>STYLEMYTH AI ATELIER</strong><small><i /> GARMENT-TO-CAMPAIGN STUDIO</small></div>
              <span className="chat-menu" aria-hidden="true">↗</span>
            </div>
            <div className="atelier-preview-body">
              <p className="chat-date">A CAMPAIGN STARTS HERE</p>
              <div className="preview-upload"><ImagePlus size={17} aria-hidden="true" /><span>Upload a garment photo</span><small>PNG · JPG · WEBP</small></div>
              <div className="preview-brief"><Sparkles size={15} aria-hidden="true" /><span>“A sunlit afternoon in the old city…”</span></div>
              <div className="preview-render"><div className="render-art"><WandSparkles size={24} aria-hidden="true" /></div><span>YOUR CAMPAIGN CONCEPT</span><ArrowRight size={16} aria-hidden="true" /></div>
            </div>
            <button className="chat-foot" onClick={() => setActiveDialog('stylist')}>
              <Sparkles size={12} aria-hidden="true" /> Open the AI Atelier <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </section>

        <MarketplaceSection onNavigate={navigateTo} />

        <section className="retailers" id="retailers" aria-labelledby="retailers-title">
          <div className="retailer-art">
            <img
              src="https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1000&q=88"
              alt="Independent clothing boutique with a curated collection"
              loading="lazy"
            />
            <div className="art-caption">YOUR CRAFT, WITH A NEW CANVAS</div>
          </div>
          <div className="retailer-copy">
            <p className="eyebrow"><span /> FOR DESIGNERS, BOUTIQUES & EMERGING LABELS</p>
            <h2 id="retailers-title">Make your label<br /><em>impossible to miss.</em></h2>
            <p>Create visual stories for your collection, then bring your label to Stylemyth’s independent fashion edit. Give customers a new way to discover the clothes, craft, and people behind your brand.</p>
            <ul>
              <li><span>01</span> Make campaign content your own</li>
              <li><span>02</span> Bring your latest pieces to the edit</li>
              <li><span>03</span> Get discovered by your local community</li>
            </ul>
            <button className="gold-button" onClick={() => setActiveDialog('retailer')}>
              Create your shopfront <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <p className="eyebrow"><span /> YOUR NEXT CAMPAIGN STARTS HERE</p>
          <h2 id="closing-title">A new world<br /><em>for every garment.</em></h2>
          <button className="gold-button" onClick={() => setActiveDialog('stylist')}>
            Start creating <Sparkles size={15} aria-hidden="true" />
          </button>
          <span className="closing-star" aria-hidden="true">✳</span>
        </section>
      </main>

      <SiteFooter onNavigate={navigateTo} />

      {activeDialog === 'stylist' && <StylistDialog onClose={() => setActiveDialog(null)} />}
      {activeDialog === 'retailer' && <RetailerDialog onClose={() => setActiveDialog(null)} />}
    </>
  )
}
