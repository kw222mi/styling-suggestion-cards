import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useOutfits from "../hooks/useOutfits.js";
import Filzer from "../components/Filzer.jsx";
import SearchBar from "../components/SearchBar.jsx";
import StyleCard from "../components/StyleCard.jsx";
import { copy } from "../lib/clipboard.js";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import useFilterSearch from "../hooks/useFilterSearch.js";
import "./Home.css";


const FAVORITES_KEY = "ssc_favorites_v2";

const pickRandom = (arr, n = 3) => {
  const copyArr = [...arr];
  for (let i = copyArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copyArr[i], copyArr[j]] = [copyArr[j], copyArr[i]];
  }
  return copyArr.slice(0, n);
};

export default function Home() {
  // mode: "shuffle" eller "sort"
  const [mode, setMode] = useState("shuffle");
  const [sortBy, setSortBy] = useState("title-asc"); // används bara i sort-läge

  // Offline-indikator
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const up = () => setOffline(false);
    const down = () => setOffline(true);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();

  // 1) Ladda data (ALLTID första hook)
  const { outfits: all, error, loading, reload } = useOutfits();

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
    if (!s) return null;
    const ids = s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (ids.length === 0) return null;
    return new Set(ids);
  }, [searchParams]);

  // Rensa ?share när användaren börjar filtrera/söka
  useEffect(() => {
    setSearchParams((p) => {
      if (p.has("share")) p.delete("share");
      return p;
    });
  }, [category, q, setSearchParams]);

  // 3) Filtrering (utan sort) och sorterad variant
  const { filtered, sorted, hasActiveFilter } = useFilterSearch(all, {
    category,
    q,
    sharedIds,
    sortBy: mode === "sort" ? sortBy : "none",
  });

  // 4) Slump-förslag när data finns & när filter ändras i shuffle-läge
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (loading || !all.length) return;
    // pool = aktuell filtermängd utan sort (så shuffle verkligen slumpas inom filtret)
    const pool = hasActiveFilter ? filtered : all;
    const pre = sharedIds ? all.filter((o) => sharedIds.has(o.id)) : null;
    setSuggestions(pre && pre.length ? pre : pickRandom(pool));
    // Kör om när filter ändras ELLER när man byter till shuffle-läge
  }, [loading, all, filtered, hasActiveFilter, sharedIds, mode]);

  // 5) Vad som visas
  const displayed = useMemo(() => {
    return mode === "sort" ? sorted : suggestions;
  }, [mode, sorted, suggestions]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((f) => f.id)),
    [favorites]
  );

  // Actions
  const reshuffle = () => {
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

  const shareLink = async () => {
    // Dela de tre som syns först i aktuellt läge (shuffle: 3 slump, sort: topp 3 sorterade)
    const pick = displayed.length > 3 ? displayed.slice(0, 3) : displayed;
    const ids = pick.map((o) => o.id).join(",");
    setSearchParams((p) => {
      p.set("share", ids);
      return p;
    });

    const url = `${location.origin}${location.pathname}?share=${ids}`;
    const ok = await copy(url);
    if (ok) {
      alert("Länk kopierad! Klistra in vart du vill ✔");
    } else {
      window.prompt("Kunde inte kopiera automatiskt. Kopiera länken:", url);
    }
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

  // 6) Render
  return (
    <div>
      {offline && (
        <div className="status">
          Du är offline – vissa funktioner kan saknas.
        </div>
      )}

      {loading && <SkeletonGrid count={3} />}

      {error && (
        <div className="status error">
          <p>Fel: {error}</p>
          <button onClick={reload}>Försök igen</button>
        </div>
      )}

      {!loading && !error && (
        <>
          <Filzer category={category} setCategory={setCategory} />
          <SearchBar value={q} onChange={setQ} />

          {/* Lägesväljare + sortering */}
          <div className="toolbar">
            {/* Visningsläge: segmented control */}
            <div className="group">
              <span className="group-label">Visning</span>
              <div className="segmented" role="radiogroup" aria-label="Visning">
                <button
                  role="radio"
                  aria-checked={mode === "shuffle"}
                  className={`seg-btn ${mode === "shuffle" ? "is-active" : ""}`}
                  onClick={() => setMode("shuffle")}
                >
                  🎲 Slumpa
                </button>
                <button
                  role="radio"
                  aria-checked={mode === "sort"}
                  className={`seg-btn ${mode === "sort" ? "is-active" : ""}`}
                  onClick={() => setMode("sort")}
                >
                  ⇅ Sortera
                </button>
              </div>
            </div>

            {/* Sorteringsval (visas bara i sort-läge) */}
            {mode === "sort" && (
              <div className="group">
                <span className="group-label">Sortering</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sortera"
                >
                  <option value="title-asc">Titel A–Ö</option>
                  <option value="title-desc">Titel Ö–A</option>
                  <option value="category-asc">Kategori A–Ö</option>
                  <option value="category-desc">Kategori Ö–A</option>
                  <option value="id-asc">ID ↑</option>
                  <option value="id-desc">ID ↓</option>
                </select>
              </div>
            )}

            {/* Primär åtgärd (visas bara i slump-läge) */}
            {mode === "shuffle" && (
              <button className="btn-primary" onClick={reshuffle}>
                🔄 Ny slump
              </button>
            )}

            {/* Visuell avdelare */}
            <div className="divider" aria-hidden="true" />

            {/* Sekundär åtgärd */}
            <button className="btn-ghost" onClick={shareLink}>
              🔗 Dela dessa
            </button>
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

          {/* Grid */}
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
