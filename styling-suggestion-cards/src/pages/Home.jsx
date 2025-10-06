import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useOutfits from "../hooks/useOutfits.js";
import Filzer from "../components/Filzer.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StyleCard from "../components/StyleCard.jsx";

const FAVORITES_KEY = "ssc_favorites_v2";

const pickRandom = (arr, n = 3) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1) Ladda data (ALLTID första hook)
  const { outfits: all, error, loading } = useOutfits();

  // 2) Övriga hooks (körs alltid, i samma ordning)
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  // Läs ev. delade id:n från URL
  const sharedIds = useMemo(() => {
    const s = searchParams.get("share");
    return s ? new Set(s.split(",")) : null;
  }, [searchParams]);

  // Rensa ?share när användaren börjar filtrera/söka
  useEffect(() => {
    setSearchParams((p) => {
      if (p.has("share")) p.delete("share");
      return p;
    });
  }, [category, q, setSearchParams]);

  // Första förslag när data finns
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (loading || !all.length) return;
    const pre = sharedIds ? all.filter((o) => sharedIds.has(o.id)) : [];
    setSuggestions(pre.length ? pre : pickRandom(all));
  }, [loading, all, sharedIds]);

  // Filtrering/sök
  const filtered = useMemo(() => {
    const byCat =
      category === "all" ? all : all.filter((o) => o.category === category);
    const term = q.trim().toLowerCase();
    if (!term) return byCat;
    return byCat.filter(
      (o) =>
        o.title.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        o.tags.some((t) => t.toLowerCase().includes(term)) ||
        o.items.some((i) => i.toLowerCase().includes(term))
    );
  }, [all, category, q]);

  // Vad som visas: filtrerat om filter/sök/share aktivt, annars 3 slump
  const hasActiveFilter = category !== "all" || q.trim() !== "" || !!sharedIds;
  const displayed = useMemo(() => {
    if (hasActiveFilter) return filtered;
    return suggestions;
  }, [hasActiveFilter, filtered, suggestions]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  // Actions
  const newStyle = () => {
    const pool = hasActiveFilter ? filtered : all;
    setSuggestions(pickRandom(pool));
    setSearchParams((p) => {
      p.delete("share");
      return p;
    });
  };

  const toggleFavorite = (o) => {
    setFavorites((prev) =>
      prev.find((p) => p.id === o.id)
        ? prev.filter((p) => p.id !== o.id)
        : [...prev, o]
    );
  };

  const shareLink = () => {
    const pick = displayed.length > 3 ? displayed.slice(0, 3) : displayed;
    const ids = pick.map((o) => o.id).join(",");
    setSearchParams((p) => {
      p.set("share", ids);
      return p;
    });
    navigator.clipboard?.writeText(
      `${location.origin}${location.pathname}?share=${ids}`
    );
    alert("Länk kopierad! Klistra in vart du vill ✔");
  };

  // Framer Motion-varianter
  const listVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } },
  };

  // 3) Render – statusmeddelanden INNE i JSX, så hooks-ordningen alltid är konstant
  return (
    <div>
      {loading && <div className="status">Laddar outfits...</div>}
      {error && <div className="status error">Fel: {error}</div>}

      {!loading && !error && (
        <>
          <Filzer category={category} setCategory={setCategory} />
          <SearchBar value={q} onChange={setQ} />

          <div className="actions" style={{ marginBottom: 16 }}>
            <motion.button
              onClick={newStyle}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.25 }}
            >
              🎲 Ny stil
            </motion.button>

            <motion.button
              className="ghost"
              onClick={shareLink}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.25 }}
            >
              🔗 Dela dessa
            </motion.button>
          </div>

          {/* Tomt tillstånd */}
          {displayed.length === 0 && (
            <div className="empty">
              <p>Inga outfits matchade din sökning eller filter.</p>
              <button
                onClick={() => {
                  setCategory("all");
                  setQ("");
                }}
              >
                Återställ filter
              </button>
            </div>
          )}

          {/* Grid med mjuk fade/scale */}
          {displayed.length > 0 && (
            <motion.div
              className="grid"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              <AnimatePresence mode="popLayout">
                {displayed.map((o) => (
                  <motion.div
                    key={o.id}
                    variants={itemVariants}
                    exit="exit"
                    layout
                  >
                    <StyleCard
                      outfit={o}
                      isFavorite={favoriteIds.has(o.id)}
                      onToggleFavorite={() => toggleFavorite(o)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
