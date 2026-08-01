import { useEffect, useRef } from "react";
import "./CursorGlow.css";

// A single fixed radial-gradient layer that tracks the cursor via
// translate3d — GPU-composited, no React re-renders per mouse move.
// Automatically inert on touch devices and prefers-reduced-motion.
export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = glowRef.current;
    if (!el) return;
    let raf = null;
    let visible = false;

    function onMove(e) {
      if (!visible) {
        el.style.opacity = "1";
        visible = true;
      }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      });
    }

    function onLeave() {
      visible = false;
      el.style.opacity = "0";
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="cursor-glow" ref={glowRef} aria-hidden="true" />;
}
