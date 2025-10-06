import { useEffect, useState } from "react";

/**
 * Laddar outfits från /public/data/outfits.json,
 * och bygger fullständiga URL:er till bilderna i /src/assets/.
 */
export default function useOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) Hämta JSON från public/
        const res = await fetch("/data/outfits.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`Fel vid laddning (${res.status})`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Ogiltigt JSON-format");

        // 2) Bygg URL till bilder i src/assets/
        const resolved = data.map((o) => {
          const file = (o.image || "").split("/").pop(); // "casual.png"
          // Viktigt: import.meta.url är filens (hookens) plats i src/,
          // så ../assets pekar mot src/assets
          const url = new URL(`../assets/${file}`, import.meta.url).href;
          return { ...o, image: url };
        });

        if (!cancelled) {
          setOutfits(resolved);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Kunde inte ladda outfits");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { outfits, error, loading };
}
