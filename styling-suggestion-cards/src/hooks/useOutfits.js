// src/hooks/useOutfits.js
import { useEffect, useState } from "react";

export default function useOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [error, setError] = useState(null); // vänlig text till UI
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // för reload()

  function reload() {
    setTick((t) => t + 1);
  }

  async function fetchWithTimeout(url, { timeout = 6000, ...opts } = {}) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, {
        ...opts,
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(t);
    }
  }

  function sanitize(data) {
    if (!Array.isArray(data)) throw new Error("SCHEMA:LIST_EXPECTED");
    const cleaned = data.filter(
      (o) =>
        o &&
        typeof o.id === "string" &&
        typeof o.title === "string" &&
        typeof o.category === "string" &&
        Array.isArray(o.items) &&
        Array.isArray(o.tags) &&
        typeof o.image === "string"
    );
    if (cleaned.length === 0) throw new Error("SCHEMA:EMPTY");
    return cleaned;
  }

  // Bilderna ligger i public/assets/. Normalisera alla varianter till en giltig URL.
  function normalizeImagePath(image) {
    if (!image) return image;
    // Redan absolut URL eller redan rot-relativ → låt vara
    if (/^https?:\/\//i.test(image) || image.startsWith("/")) return image;
    // Om JSON redan har "assets/fil.png"
    if (image.startsWith("assets/")) return `/${image}`;
    // Annars antar vi ett filnamn → pekar på /assets/fil.png
    return `/assets/${image}`;
  }

  function resolveImages(list) {
    return list.map((o) => ({ ...o, image: normalizeImagePath(o.image) }));
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Ligger outfits.json i public/ (rekommenderat)
        let res = await fetchWithTimeout("/outfits.json", { timeout: 6000 });

        // enkel retry om första inte var OK
        if (!res.ok) {
          res = await fetchWithTimeout("/outfits.json", { timeout: 6000 });
        }

        if (!res.ok) {
          if (res.status === 404) throw new Error("HTTP:404");
          throw new Error(`HTTP:${res.status || 0}`);
        }

        // Säkerställ JSON (inte en HTML-sida)
        const ct = res.headers.get("content-type") || "";
        if (!ct.includes("application/json"))
          throw new Error("JSON:CONTENT_TYPE");

        let data;
        try {
          data = await res.json();
        } catch {
          throw new Error("JSON:PARSE");
        }

        const sane = sanitize(data);
        const resolved = resolveImages(sane);

        if (!cancelled) {
          setOutfits(resolved);
          setError(null);
        }
      } catch (e) {
        let msg = "Ett fel uppstod när outfits skulle laddas.";
        const code = String(e?.message || "");

        if (code === "HTTP:404") {
          msg =
            "Hittade inte datafilen (/outfits.json). Kontrollera att den ligger i projektets public/-mapp.";
        } else if (code.startsWith("HTTP:")) {
          const status = code.split(":")[1];
          msg = `Fel vid laddning av data (HTTP ${status}).`;
        } else if (code === "SCHEMA:LIST_EXPECTED") {
          msg = "Datafilen har fel format (förväntade en lista).";
        } else if (code === "SCHEMA:EMPTY") {
          msg = "Datafilen saknar giltigt innehåll.";
        } else if (code === "JSON:CONTENT_TYPE" || code === "JSON:PARSE") {
          msg = "Datafilen verkar inte vara giltig JSON.";
        } else if (code.includes("AbortError")) {
          msg = "Tidsgränsen överskreds vid hämtning av data.";
        } else if (e?.name === "TypeError") {
          // Nätverksfel i fetch blir ofta TypeError
          msg = "Nätverksfel. Kontrollera din uppkoppling.";
        }

        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return { outfits, error, loading, reload };
}
