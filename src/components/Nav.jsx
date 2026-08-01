import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Nav.css";

const LINKS = [
  { to: "/", label: "home", end: true },
  { to: "/projects", label: "projects" },
  { to: "/services", label: "services" },
  { to: "/dashboard", label: "dashboard" },
  { to: "/experience", label: "experience" },
  { to: "/contact", label: "contact" },
];

export default function Nav({ onOpenPalette }) {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <NavLink to="/" className="logo">
          <span className="dot" />
          aman@mulani:~$
        </NavLink>

        <nav className="links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={onOpenPalette} aria-label="Open command palette">
            <span className="kbd">⌘K</span>
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☾" : "☀"}
          </button>
          <a className="nav-cta" href="/Aman_Mulani_Resume.pdf" download>
            ↓ resume
          </a>
          <button className="nav-toggle" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setMobileOpen(false)}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
