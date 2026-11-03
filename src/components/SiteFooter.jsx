export default function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <button className="brand" onClick={() => onNavigate('top')} aria-label="Back to top">
        STYLE<span>MYTH</span><sup>®</sup>
      </button>
      <p>Independent style, thoughtfully found.</p>
      <nav aria-label="Footer navigation">
        <button onClick={() => onNavigate('studio')}>AI stylist</button>
        <button onClick={() => onNavigate('marketplace')}>Discover</button>
        <button onClick={() => onNavigate('retailers')}>For retailers</button>
      </nav>
      <small>© 2026 STYLEMYTH. GOOD STYLE, GOOD FEELING.</small>
    </footer>
  )
}
