import { useCallback, useEffect, useRef, useState } from "react";
import "./DiagramCanvas.css";

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.2;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Hosts a diagram inside a pannable, zoomable viewport with a small
// toolbar (zoom in/out, reset, focus mode) — the interaction shell
// that turns a static SVG illustration into something that behaves
// like a real architecture explorer. Pan/zoom state lives here so the
// diagrams themselves stay pure layout.
export default function DiagramCanvas({ children, focusMode, onToggleFocus, title }) {
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const zoomBy = useCallback((delta) => {
    setT((prev) => ({ ...prev, scale: clamp(+(prev.scale + delta).toFixed(2), MIN_SCALE, MAX_SCALE) }));
  }, []);

  const reset = useCallback(() => setT({ scale: 1, x: 0, y: 0 }), []);

  const onWheel = (e) => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    zoomBy(e.deltaY > 0 ? -0.1 : 0.1);
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    moved.current = false;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    setT((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };
  const stopDrag = () => { dragging.current = false; };

  useEffect(() => {
    if (!focusMode) return;
    const onKey = (e) => { if (e.key === "Escape") onToggleFocus(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, onToggleFocus]);

  useEffect(() => { reset(); }, [focusMode, reset]);

  return (
    <div className={`diagram-canvas${focusMode ? " diagram-canvas-focus" : ""}`}>
      <div className="diagram-toolbar">
        {focusMode && <span className="diagram-toolbar-title">{title}</span>}
        <button type="button" onClick={() => zoomBy(-0.15)} aria-label="Zoom out">−</button>
        <span className="diagram-toolbar-scale">{Math.round(t.scale * 100)}%</span>
        <button type="button" onClick={() => zoomBy(0.15)} aria-label="Zoom in">+</button>
        <button type="button" onClick={reset} aria-label="Reset zoom and pan">reset</button>
        <button
          type="button"
          className="diagram-toolbar-focus"
          onClick={onToggleFocus}
          aria-pressed={focusMode}
        >
          {focusMode ? "exit focus" : "focus mode"}
        </button>
      </div>
      <div
        className="diagram-viewport"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stopDrag}
        onPointerLeave={stopDrag}
        style={{ cursor: dragging.current ? "grabbing" : "grab" }}
      >
        <div
          className="diagram-pan"
          style={{ transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})` }}
          onClickCapture={(e) => { if (moved.current) { e.stopPropagation(); } }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
