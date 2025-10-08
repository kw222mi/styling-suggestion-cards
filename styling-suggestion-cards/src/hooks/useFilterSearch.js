import { useMemo } from "react";

/**
 * Filtrerar outfits baserat på kategori + fritextsök.
 * - Matchar i title, description, tags, items (case-insensitive).
 * - Returnerar även hasActiveFilter (bra för UI-logik).
 *
 * @param {Array} all - alla outfits
 * @param {Object} opts
 * @param {string} opts.category - aktiv kategori ("all" = ingen)
 * @param {string} opts.q - söksträng
 * @param {Set|null} opts.sharedIds - används bara för UI (flagga aktivt filter)
 */
export default function useFilterSearch(
  all,
  { category = "all", q = "", sharedIds = null } = {}
) {
  const term = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    const byCat =
      category === "all" ? all : all.filter((o) => o.category === category);

    if (!term) return byCat;

    return byCat.filter((o) => {
      const inTitle = o.title?.toLowerCase().includes(term);
      const inDesc = o.description?.toLowerCase().includes(term);
      const inTags =
        Array.isArray(o.tags) &&
        o.tags.some((t) => t.toLowerCase().includes(term));
      const inItems =
        Array.isArray(o.items) &&
        o.items.some((i) => i.toLowerCase().includes(term));
      return inTitle || inDesc || inTags || inItems;
    });
  }, [all, category, term]);

  const hasActiveFilter = category !== "all" || term !== "" || !!sharedIds;

  return { filtered, hasActiveFilter };
}
