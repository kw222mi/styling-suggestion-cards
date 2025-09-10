export default function StyleCard({ outfit, isFavorite, onToggleFavorite }){
  return (
    <article className="card" aria-label={`Outfit ${outfit.title}`}>
      <img src={outfit.image} alt={outfit.title} loading="lazy"/>
      <div className="content">
        <strong>{outfit.title}</strong>
        <p>{outfit.description}</p>
        <div className="badges">
          {outfit.tags.map(t => <span className="badge" key={t}>{t}</span>)}
        </div>
      </div>
      <div className="footer">
        <span>{outfit.items.join(' · ')}</span>
        <button onClick={onToggleFavorite} aria-pressed={isFavorite}>
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
    </article>
  )
}
