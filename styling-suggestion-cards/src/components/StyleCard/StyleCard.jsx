import { motion } from "framer-motion";
import SafeImg from "../SafeImg.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";

// OBS: Den här komponenten fungerar både med props OCH context.
// - Har du propsen (isFavorite, onToggleFavorite)? → de används.
// - Annars används FavoritesContext automatiskt.

export default function StyleCard({
  outfit,
  isFavorite: isFavoriteProp,
  onToggleFavorite: onToggleFavoriteProp,
}) {
  const { isFavorite: ctxIsFavorite, toggleFavorite } = useFavorites();

  // 1) Bestäm favoritstatus
  const isFavorite =
    typeof isFavoriteProp === "boolean"
      ? isFavoriteProp
      : ctxIsFavorite(outfit.id);

  // 2) Bestäm togglaren
  const onToggleFavorite =
    typeof onToggleFavoriteProp === "function"
      ? onToggleFavoriteProp
      : () => toggleFavorite(outfit);

  return (
    <motion.article
      className="card"
      aria-label={`Outfit ${outfit.title}`}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.2 }}
      layout
    >
      <SafeImg src={outfit.image} alt={outfit.title} />
      <div className="content">
        <strong>{outfit.title}</strong>

        {/* Du kan ta bort inline-stylen när du vill – funkar lika bra i CSS */}
        <p style={{ opacity: 0.9 }}>{outfit.description}</p>

        <div className="badges">
          {outfit.tags.map((t) => (
            <span className="badge" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="footer">
        <span
          title={outfit.items.join(", ")}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "60%",
          }}
        >
          {outfit.items.join(" · ")}
        </span>

        <motion.button
          onClick={onToggleFavorite}
          aria-pressed={isFavorite}
          whileTap={{ scale: 0.8 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 0.25 }}
          style={{ fontSize: "1.3rem", lineHeight: "1" }}
        >
          {isFavorite ? "♥" : "♡"}
        </motion.button>
      </div>
    </motion.article>
  );
}
