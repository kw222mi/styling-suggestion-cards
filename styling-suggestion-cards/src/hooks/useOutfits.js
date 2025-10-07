import { useEffect, useState } from "react";

export default function useOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [error, setError] = useState(null); // vänlig text till UI
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // för reload()

  function reload() {
    setTick((t) => t + 1);
  } // exponeras till UI

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

  function resolveImages(list) {
    return list.map((o) => {
      const file = (o.image || "").split("/").pop();
      const url = new URL(`../assets/${file}`, import.meta.url).href;
      return { ...o, image: url };
    });
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        let res = await fetchWithTimeout("/data/outfits.json", {
          timeout: 6000,
        });

        // enkel retry
        if (!res.ok) {
          res = await fetchWithTimeout("/data/outfits.json", { timeout: 6000 });
        }

        if (!res.ok) {
          // vänliga meddelanden per status
          if (res.status === 404) throw new Error("HTTP:404");
          throw new Error(`HTTP:${res.status || 0}`);
        }

        // säkerställ att svaret verkligen är JSON (inte en 404-HTML)
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
        // mappa tekniska fel till vänliga texter
        let msg = "Ett fel uppstod när outfits skulle laddas.";
        const code = String(e?.message || "");

        if (code === "HTTP:404") {
          msg =
            "Hittade inte datafilen (/data/outfits.json). Kontrollera att den ligger i mappen public/data.";
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
        // (valfritt) console.warn("useOutfits error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // tick triggar omhämtning via reload()
  }, [tick]);

  return { outfits, error, loading, reload };
}
