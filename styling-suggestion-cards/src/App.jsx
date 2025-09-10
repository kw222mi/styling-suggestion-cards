import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header.jsx'
import StyleCard from './components/StyleCard.jsx'
import outfitsData from './data/outfits.json'

const pickRandom = (arr, n=3) => {
  const copy = [...arr]
  // Fisher-Yates shuffle first n
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n)
}

const FAVORITES_KEY = 'ssc_favorites_v1'

export default function App(){
  const allOutfits = outfitsData.map((o) => ({
    ...o,
    image: new URL(o.image, import.meta.url).href,
  }));

  const [suggestions, setSuggestions] = useState(()=> pickRandom(allOutfits))
  const [favorites, setFavorites] = useState(()=>{
    try{
      const raw = localStorage.getItem(FAVORITES_KEY)
      return raw ? JSON.parse(raw) : []
    }catch{ return []}
  })

  useEffect(()=>{
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const favoriteIds = useMemo(()=> new Set(favorites.map(f=>f.id)), [favorites])

  const newStyle = ()=> setSuggestions(pickRandom(allOutfits))

  const toggleFavorite = (outfit)=>{
    setFavorites(prev => {
      const exists = prev.find(p => p.id === outfit.id)
      if(exists){
        return prev.filter(p => p.id !== outfit.id)
      }else{
        return [...prev, outfit]
      }
    })
  }

  const clearFavorites = ()=> setFavorites([])

  return (
    <div className="container">
      <Header
        onNewStyle={newStyle}
        favoritesCount={favorites.length}
        onClearFavorites={clearFavorites}
      />

      <div className="grid">
        {suggestions.map(o => (
          <StyleCard
            key={o.id}
            outfit={o}
            isFavorite={favoriteIds.has(o.id)}
            onToggleFavorite={()=> toggleFavorite(o)}
          />
        ))}
      </div>

      <section style={{marginTop:24}}>
        <h2>Favoriter</h2>
        {favorites.length === 0 ? (
          <div className="empty">Inga favoriter ännu. Klicka på ♡ på ett kort för att spara det här.</div>
        ) : (
          <div className="grid">
            {favorites.map(o => (
              <StyleCard
                key={o.id}
                outfit={o}
                isFavorite={true}
                onToggleFavorite={()=> toggleFavorite(o)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
