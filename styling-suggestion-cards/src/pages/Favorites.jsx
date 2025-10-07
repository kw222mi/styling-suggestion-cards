// src/pages/Favorites.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StyleCard from "../components/StyleCard.jsx";

const FAVORITES_KEY = "ssc_favorites_v2";

export default function Favorites() {
  const nav = useNavigate();

  // 1) Läs favoriter (med enkel felhantering)
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
    } catch (e) {
      return [];
    }
  });

  // 2) Persist vid ändring + fånga ev. fel
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      setError(null);
    } catch (e) {
      setError("Kunde inte spara favoriter (localStorage).");
    }
  }, [favorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  // 3) Actions
  const remove = (o) =>
    setFavorites((prev) => prev.filter((p) => p.id !== o.id));
  const clear = () => {
    if (favorites.length === 0) return;
    if (confirm("Rensa alla favoriter?")) setFavorites([]);
  };

  // 4) Motion-varianter
  const listVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } },
  };

  // 5) Render
  return (
    <section>
      {/* Felmeddelande om localStorage-strul */}
      {error && <div className="status error">Fel: {error}</div>}

      {/* Actions-rad */}
      <div className="actions" style={{ marginBottom: 12 }}>
        <button onClick={() => nav("/")} className="ghost">
          Utforska outfits
        </button>
        <button onClick={clear}>Rensa alla ({favorites.length})</button>
      </div>

      {/* Tomt-tillstånd */}
      {favorites.length === 0 && (
        <div className="empty">
          <p>Du har inga sparade favoriter ännu.</p>
          <button onClick={() => nav("/")}>Gå till Utforska</button>
        </div>
      )}

      {/* Grid med polish */}
      {favorites.length > 0 && (
        <motion.div
          className="grid"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((o) => (
              <motion.div key={o.id} variants={itemVariants} exit="exit" layout>
                <StyleCard
                  outfit={o}
                  isFavorite={favoriteIds.has(o.id)}
                  onToggleFavorite={() => remove(o)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
