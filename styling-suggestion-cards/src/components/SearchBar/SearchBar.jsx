import "./SearchBar.css"

export default function SearchBar({
  value,
  onChange,
  placeholder = "Sök outfit, tagg, plagg...",
}) {
  return (
    <input
      className="searchbar-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label="Sök"
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #ddd",
        marginBottom: 16,
        background: "var(--input-bg,white)",
        color: "inherit",
      }}
    />
  );
}
