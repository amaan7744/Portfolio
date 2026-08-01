import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profile, projects, services } from "../data/content";
import { ASSISTANT_TOGGLE_EVENT } from "../assistant/AssistantWidget";
import "./CommandPalette.css";

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const actions = useMemo(() => {
    const base = [
      { id: "home", label: "Go to Home", hint: "page", run: () => navigate("/") },
      { id: "projects", label: "Go to Projects", hint: "page", run: () => navigate("/projects") },
      { id: "services", label: "Go to Services", hint: "page", run: () => navigate("/services") },
      { id: "dashboard", label: "Go to Engineering Dashboard", hint: "page", run: () => navigate("/dashboard") },
      { id: "experience", label: "Go to Experience", hint: "page", run: () => navigate("/experience") },
      { id: "contact", label: "Go to Contact", hint: "page", run: () => navigate("/contact") },
      {
        id: "ask-ai",
        label: "Ask the AI assistant",
        hint: "⌘J",
        run: () => window.dispatchEvent(new CustomEvent(ASSISTANT_TOGGLE_EVENT)),
      },
      {
        id: "resume",
        label: "Download résumé (PDF)",
        hint: "file",
        run: () => window.open(profile.resume, "_blank"),
      },
      {
        id: "github",
        label: "Open GitHub profile",
        hint: "link",
        run: () => window.open(profile.github, "_blank"),
      },
      {
        id: "linkedin",
        label: "Open LinkedIn profile",
        hint: "link",
        run: () => window.open(profile.linkedin, "_blank"),
      },
      {
        id: "email",
        label: `Copy email — ${profile.email}`,
        hint: "action",
        run: () => navigator.clipboard.writeText(profile.email),
      },
    ];
    const projectActions = projects.map((p) => ({
      id: `project-${p.slug}`,
      label: `Open project — ${p.name}`,
      hint: "case study",
      run: () => navigate(`/projects/${p.slug}`),
    }));
    const serviceActions = services.map((s) => ({
      id: `service-${s.id}`,
      label: `Open service — ${s.name}`,
      hint: "service",
      run: () => navigate(`/services/${s.id}`),
    }));
    return [...base, ...projectActions, ...serviceActions];
  }, [navigate]);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <span className="palette-prompt">$</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            aria-label="Command palette"
          />
          <span className="kbd">esc</span>
        </div>
        <div className="palette-list">
          {filtered.length === 0 && <div className="palette-empty">No matches.</div>}
          {filtered.map((a) => (
            <button
              key={a.id}
              className="palette-item"
              onClick={() => {
                a.run();
                onClose();
              }}
            >
              <span>{a.label}</span>
              <span className="palette-hint">{a.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
