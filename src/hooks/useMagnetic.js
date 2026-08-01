import { useEffect, useRef } from "react";

// Nudges an element a few pixels toward the cursor while hovered, and
// springs back on leave — the "magnetic button" pattern used across
// Linear/Raycast/Stripe marketing sites. Pure transform (no layout
// writes), disabled for touch pointers and prefers-reduced-motion.
export default function useMagnetic(strength = 0.25) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
    }

    function onLeave() {
      el.style.transform = "";
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return ref;
}
