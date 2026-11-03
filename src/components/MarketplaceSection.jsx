import { useMemo, useState } from 'react'
import { ArrowRight, ArrowUpRight, Bookmark, Check, Search } from 'lucide-react'
import { categories, pieces } from '../data/marketplace.js'

function ProductCard({ piece, index, isSaved, onToggleSave }) {
  return (
    <article className="product-card">
      <div className="product-photo">
        <img src={piece.image} alt={piece.title} loading="lazy" />
        <span className="product-tag">{piece.type}</span>
        <button
          className={isSaved ? 'save-button saved' : 'save-button'}
          onClick={() => onToggleSave(piece.id)}
          aria-label={isSaved ? `Remove ${piece.title} from saved pieces` : `Save ${piece.title}`}
          aria-pressed={isSaved}
        >
          {isSaved ? <Check size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}
        </button>
        <span className="photo-index">{String(index + 1).padStart(2, '0')} / 03</span>
      </div>
      <div className="product-info">
        <div className="shop-line">
          <span>{piece.shop}</span>
          <span><i aria-hidden="true" /> {piece.location}</span>
        </div>
        <div className="product-title">
          <h3>{piece.title}</h3>
          <strong>{piece.price}</strong>
        </div>
        <button className="discover-link">
          Discover the label <ArrowUpRight size={15} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export default function MarketplaceSection({ onNavigate }) {
  const [category, setCategory] = useState(categories[0])
  const [search, setSearch] = useState('')
  const [savedIds, setSavedIds] = useState([])

  const filteredPieces = useMemo(() => {
    const query = search.trim().toLowerCase()
    return pieces.filter((piece) => {
      const matchesCategory = category === categories[0] || piece.category === category
      const searchableText = `${piece.shop} ${piece.title} ${piece.location}`.toLowerCase()
      return matchesCategory && searchableText.includes(query)
    })
  }, [category, search])

  const toggleSaved = (pieceId) => {
    setSavedIds((current) => current.includes(pieceId)
      ? current.filter((savedId) => savedId !== pieceId)
      : [...current, pieceId])
  }

  return (
    <section className="marketplace" id="marketplace" aria-labelledby="marketplace-title">
      <div className="market-head">
        <div>
          <p className="eyebrow"><span /> THE INDEPENDENT EDIT</p>
          <h2 id="marketplace-title">Local labels.<br /><em>New perspectives.</em></h2>
        </div>
        <p className="market-sub">Discover the next names in your wardrobe. Every piece has a point of view, and a real local label behind it.</p>
      </div>

      <div className="market-tools">
        <div className="filter-tabs" role="group" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={15} aria-hidden="true" />
          <input
            aria-label="Search labels and styles"
            placeholder="Search labels or styles"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <div className="product-grid" aria-live="polite">
        {filteredPieces.length > 0 ? filteredPieces.map((piece, index) => (
          <ProductCard
            key={piece.id}
            piece={piece}
            index={index}
            isSaved={savedIds.includes(piece.id)}
            onToggleSave={toggleSaved}
          />
        )) : <p className="empty-state">No pieces found. Try a different search or category.</p>}
      </div>

      <div className="market-foot">
        <span>Curated for you, rooted in your neighbourhood.</span>
        <button className="inline-link" onClick={() => { setCategory(categories[0]); setSearch(''); onNavigate('marketplace') }}>
          View all labels <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
