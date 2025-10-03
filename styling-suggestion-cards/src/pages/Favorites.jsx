import { useEffect, useState } from "react";
import StyleCard from "../components/StyleCard.jsx";

const FAVORITES_KEY = "ssc_favorites_v2";

export default function Favorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  useEffect(
    () => localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)),
    [favorites]
  );

  const remove = (o) =>
    setFavorites((prev) => prev.filter((p) => p.id !== o.id));
  const clear = () => setFavorites([]);

  return (
    <section>
      <div className="actions" style={{ marginBottom: 12 }}>
        <button onClick={clear} className="ghost">
          Rensa alla ({favorites.length})
        </button>
      </div>
      {favorites.length === 0 ? (
        <div className="empty">
          Inga favoriter ännu. Gå till “Utforska” och spara ♡
        </div>
      ) : (
        <div className="grid">
          {favorites.map((o) => (
            <StyleCard
              key={o.id}
              outfit={o}
              isFavorite={true}
              onToggleFavorite={() => remove(o)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
