export default function Header({ onNewStyle, favoritesCount, onClearFavorites }){
  return (
    <div className="header">
      <h1>Styling Suggestion Cards</h1>
      <div className="actions">
        <button onClick={onNewStyle} aria-label="Ny stil">🎲 Ny stil</button>
        <button onClick={onClearFavorites} className="ghost" aria-label="Rensa favoriter">
          Rensa favoriter ({favoritesCount})
        </button>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <button className="ghost">GitHub</button>
        </a>
      </div>
    </div>
  )
}
