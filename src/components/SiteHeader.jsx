import { Menu, Sparkles, X } from 'lucide-react'

export default function SiteHeader({ menuOpen, onMenuToggle, onNavigate, onOpenStylist }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => onNavigate('top')} aria-label="Stylemyth home">
        STYLE<span>MYTH</span><sup>®</sup>
      </button>

      <nav className={menuOpen ? 'site-nav open' : 'site-nav'} aria-label="Main navigation">
        <button onClick={() => onNavigate('studio')}>AI stylist</button>
        <button onClick={() => onNavigate('marketplace')}>Discover</button>
        <button onClick={() => onNavigate('retailers')}>For retailers</button>
      </nav>

      <div className="header-actions">
        <button className="header-cta" onClick={onOpenStylist}>
          Create a campaign <Sparkles size={14} aria-hidden="true" />
        </button>
        <button
          className="menu-button"
          onClick={onMenuToggle}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
    </header>
  )
}
