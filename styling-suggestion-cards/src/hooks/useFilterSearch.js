import { useMemo } from "react";

/**
 * Filtrerar på kategori + sök. Valfri sortering.
 * sortBy:
 *  - "none"  → ingen sortering (returnerar bara filtrerat)
 *  - "title-asc" | "title-desc" | "category-asc" | "category-desc" | "id-asc" | "id-desc"
 */
export default function useFilterSearch(
  all,
  { category = "all", q = "", sharedIds = null, sortBy = "none" } = {}
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

  const sorted = useMemo(() => {
    if (!filtered.length) return filtered;
    if (!sortBy || sortBy === "none") return filtered;

    const arr = [...filtered];
    const cmp = (a, b, key, dir = 1) => {
      const av = (a[key] ?? "").toString().toLowerCase();
      const bv = (b[key] ?? "").toString().toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      // stabil sortering → falla tillbaka på id
      const ai = (a.id ?? "").toString().toLowerCase();
      const bi = (b.id ?? "").toString().toLowerCase();
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    };

    switch (sortBy) {
      case "title-asc":
        arr.sort((a, b) => cmp(a, b, "title", 1));
        break;
      case "title-desc":
        arr.sort((a, b) => cmp(a, b, "title", -1));
        break;
      case "category-asc":
        arr.sort((a, b) => cmp(a, b, "category", 1));
        break;
      case "category-desc":
        arr.sort((a, b) => cmp(a, b, "category", -1));
        break;
      case "id-asc":
        arr.sort((a, b) => cmp(a, b, "id", 1));
        break;
      case "id-desc":
        arr.sort((a, b) => cmp(a, b, "id", -1));
        break;
      default:
        /* okänd sort → ingen sort */ break;
    }
    return arr;
  }, [filtered, sortBy]);

  const hasActiveFilter = category !== "all" || term !== "" || !!sharedIds;

  // Returnera både oförändrad filtrering och sorterad variant
  return { filtered, sorted, hasActiveFilter };
}
