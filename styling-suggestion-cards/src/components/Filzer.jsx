// src/components/Filzer.jsx
const CATEGORIES = [
  { id: "all", label: "Alla" },
  { id: "casual", label: "Casual" },
  { id: "office", label: "Office" },
  { id: "sporty", label: "Sporty" },
  { id: "evening", label: "Evening" },
  { id: "denim", label: "Denim" },
];

export default function Filzer({ category, setCategory }) {
  return (
    <div className="actions" style={{ marginBottom: 16, flexWrap: "wrap" }}>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          onClick={() => setCategory((prev) => (prev === c.id ? "all" : c.id))}
          className={category === c.id ? "active" : "ghost"}
          aria-pressed={category === c.id}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
