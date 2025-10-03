import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider.jsx";

export default function Header() {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { theme, toggle } = useTheme();

  return (
    <div className="header">
      <h1 style={{ cursor: "pointer" }} onClick={() => nav("/")}>
        Styling Suggestion Cards
      </h1>
      <div className="actions">
        <Link to="/">
          <button className={pathname === "/" ? "" : "ghost"}>Utforska</button>
        </Link>
        <Link to="/favorites">
          <button className={pathname === "/favorites" ? "" : "ghost"}>
            Favoriter
          </button>
        </Link>
        <button onClick={toggle} className="ghost" aria-label="Byt tema">
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          <button className="ghost">GitHub</button>
        </a>
      </div>
    </div>
  );
}
