import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./Assistant.css";

// The panel (chat UI, engine, knowledge base, markdown renderer) is only
// fetched once the visitor opens it — the floating button itself stays
// tiny so it costs nothing on every other page load.
const AssistantPanel = lazy(() => import("./AssistantPanel"));

// Global open/close event so other parts of the app (e.g. the command
// palette) can trigger the assistant without the widget needing to lift
// its open state up into App — keeps the feature self-contained/modular.
export const ASSISTANT_TOGGLE_EVENT = "assistant:toggle";

function PanelSkeleton() {
  return (
    <div className="asst-panel asst-skeleton" aria-hidden="true">
      <div className="asst-skel-line" style={{ width: "40%" }} />
      <div className="asst-skel-bubble" />
      <div className="asst-skel-bubble" style={{ width: "70%" }} />
      <div className="asst-skel-bubble" style={{ width: "55%" }} />
    </div>
  );
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const fabRef = useRef(null);

  const close = () => {
    setOpen(false);
    setFocusMode(false);
    // Return focus to the trigger for keyboard/screen-reader users instead
    // of dropping it on <body> when the panel unmounts.
    requestAnimationFrame(() => fabRef.current?.focus());
  };

  // Ctrl/Cmd+J toggles the assistant from anywhere on the site, mirroring
  // the existing Ctrl/Cmd+K command palette shortcut.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    function onToggleEvent() {
      setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener(ASSISTANT_TOGGLE_EVENT, onToggleEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(ASSISTANT_TOGGLE_EVENT, onToggleEvent);
    };
  }, []);

  return (
    <>
      {!open && (
        <button
          ref={fabRef}
          type="button"
          className="asst-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant — ask about Aman's projects and skills (shortcut: Ctrl/Cmd+J)"
          title="Ask AI (Ctrl/Cmd+J)"
        >
          <span className="asst-fab-ring" aria-hidden="true" />
          <svg className="asst-fab-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2L14.2 9.2L21 12L14.2 14.8L12 22L9.8 14.8L3 12L9.8 9.2L12 2Z" fill="currentColor" />
          </svg>
          ask AI
        </button>
      )}

      {open && (
        <Suspense fallback={<PanelSkeleton />}>
          <AssistantPanel
            onClose={close}
            focusMode={focusMode}
            onToggleFocus={() => setFocusMode((f) => !f)}
          />
        </Suspense>
      )}
    </>
  );
}
