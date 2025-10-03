import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import outfitsData from "../data/outfits.json";
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

  // --- Resolve asset URLs ---
  const all = useMemo(
    () =>
      outfitsData.map((o) => {
        const file = o.image.split("/").pop(); // t.ex. "casual.svg"
        const url = new URL(`../assets/${file}`, import.meta.url).href; // relativt /pages/
        return { ...o, image: url };
      }),
    []
  );

  // --- Shared IDs via ?share=a,b,c ---
  const sharedIds = useMemo(() => {
    const s = searchParams.get("share");
    return s ? new Set(s.split(",")) : null;
  }, [searchParams]);

  // --- Favorites ---
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

  // --- Filter & search ---
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  // Rensa ?share när användaren börjar filtrera/söka
  useEffect(() => {
    setSearchParams((p) => {
      if (p.has("share")) p.delete("share");
      return p;
    });
  }, [category, q, setSearchParams]);

  // --- Init-suggestions (beaktar share) ---
  const [suggestions, setSuggestions] = useState(() => {
    if (sharedIds) {
      const pre = all.filter((o) => sharedIds.has(o.id));
      return pre.length ? pre : pickRandom(all);
    }
    return pickRandom(all);
  });

  // --- Filtered list ---
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

  // --- Displayed: filtrerat om nåt filter/sök/share; annars 3 slump ---
  const hasActiveFilter = category !== "all" || q.trim() !== "" || !!sharedIds;
  const displayed = useMemo(() => {
    if (hasActiveFilter) return filtered;
    return suggestions;
  }, [hasActiveFilter, filtered, suggestions]);

  // --- Favorite IDs (för snabb lookup) ---
  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  // --- Actions ---
  const newStyle = () => {
    const pool = category === "all" && !q ? all : filtered;
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

  const listVariants = {
    hidden: { opacity: 1 }, // behåll container synlig
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } },
  };


  // --- Render ---
  return (
    <div>
      <Filzer category={category} setCategory={setCategory} />
      <SearchBar value={q} onChange={setQ} />
      <div className="actions" style={{ marginBottom: 16 }}>
        <motion.button
          onClick={newStyle}
          whileTap={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.05 }}
         
        >
          🎲 Ny stil
        </motion.button>
        <motion.button
          className="ghost"
          onClick={shareLink}
          whileTap={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.25 }}
          whileHover={{ scale: 1.05 }}
        >
          🔗 Dela dessa
        </motion.button>
      </div>

      <motion.div
        className="grid"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence mode="popLayout">
          {displayed.map((o) => (
            <motion.div key={o.id} variants={itemVariants} exit="exit" layout>
              <StyleCard
                outfit={o}
                isFavorite={favoriteIds.has(o.id)}
                onToggleFavorite={() => toggleFavorite(o)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
