import { createContext, useContext, useEffect, useState, useMemo } from "react";

const FavoritesContext = createContext();

const FAVORITES_KEY = "ssc_favorites_v2";

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) ?? [];
    } catch {
      return [];
    }
  });

  // 🧩 Spara till localStorage
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // 🧠 Smidiga hjälpfunktioner
  const addFavorite = (item) =>
    setFavorites((prev) =>
      prev.find((p) => p.id === item.id) ? prev : [...prev, item]
    );

  const removeFavorite = (itemId) =>
    setFavorites((prev) => prev.filter((p) => p.id !== itemId));

  const toggleFavorite = (item) =>
    setFavorites((prev) =>
      prev.find((p) => p.id === item.id)
        ? prev.filter((p) => p.id !== item.id)
        : [...prev, item]
    );

  const isFavorite = (id) => favorites.some((f) => f.id === id);

  // 📦 Memoiserat value (för prestanda)
  const value = useMemo(
    () => ({
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
    }),
    [favorites]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Custom hook – för enkel åtkomst
export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites must be used within a FavoritesProvider");
  return context;
}
