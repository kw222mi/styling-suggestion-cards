import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useOutfits from "../hooks/useOutfits.js";
import Filzer from "../components/Filzer/Filzer.jsx";
import SearchBar from "../components/SearchBar/SearchBar.jsx";
import StyleCard from "../components/StyleCard/StyleCard.jsx";
import { copy } from "../lib/clipboard.js";
import SkeletonGrid from "../components/SkeletonGrid.jsx";
import useFilterSearch from "../hooks/useFilterSearch.js";
import "./Home.css";
import { useFavorites } from "../context/FavoritesContext.jsx";

const pickRandom = (arr, n = 3) => {
  const copyArr = [...arr];
  for (let i = copyArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copyArr[i], copyArr[j]] = [copyArr[j], copyArr[i]];
  }
  return copyArr.slice(0, n);
};

export default function Home() {
  // === VISNINGSLÄGE ===
  const [mode, setMode] = useState("shuffle"); // "shuffle" | "sort"
  const [sortBy, setSortBy] = useState("title-asc");

  // === OFFLINE-INDIKATOR ===
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

  // === DATA (alltid först) ===
  const { outfits: all, error, loading, reload } = useOutfits();

  // === FAVORITER FRÅN CONTEXT ===
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // === FILTER/SÖKSTATE ===
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  // === DELADE ID:N FRÅN URL ===
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

  // Rensa ?share när man börjar filtrera/söka
  useEffect(() => {
    setSearchParams((p) => {
      if (p.has("share")) p.delete("share");
      return p;
    });
  }, [category, q, setSearchParams]);

  // === FILTRERING + SORTERING ===
  const { filtered, sorted, hasActiveFilter } = useFilterSearch(all, {
    category,
    q,
    sharedIds,
    sortBy: mode === "sort" ? sortBy : "none",
  });

  // === SLUMP-FÖRSLAG ===
  const [suggestions, setSuggestions] = useState([]);
  useEffect(() => {
    if (loading || !all.length) return;
    // Slumpa inom aktuell filtermängd (utan sort)
    const pool = hasActiveFilter ? filtered : all;
    const pre = sharedIds ? all.filter((o) => sharedIds.has(o.id)) : null;
    setSuggestions(pre && pre.length ? pre : pickRandom(pool));
  }, [loading, all, filtered, hasActiveFilter, sharedIds, mode]);

  // === VAD SOM VISAS ===
  const displayed = useMemo(() => {
    return mode === "sort" ? sorted : suggestions;
  }, [mode, sorted, suggestions]);

  // === ACTIONS ===
  const reshuffle = () => {
    const pool = hasActiveFilter ? filtered : all;
    setSuggestions(pickRandom(pool));
    setSearchParams((p) => {
      p.delete("share");
      return p;
    });
  };

  const shareLink = async () => {
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

  // === FRAMER MOTION ===
  const listVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } },
  };

  // === RENDER ===
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

          {/* Toolbar: läge, sortering, dela */}
          <div className="toolbar">
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

            {mode === "shuffle" && (
              <button className="btn-primary" onClick={reshuffle}>
                🔄 Ny slump
              </button>
            )}

            <div className="divider" aria-hidden="true" />

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
                      isFavorite={isFavorite(o.id)}
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
