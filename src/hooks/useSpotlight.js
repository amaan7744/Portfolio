import { useEffect, useRef } from "react";

// Attaches ONE delegated mousemove listener to a container and updates
// --mx / --my CSS custom properties on whichever `.spotlight` child is
// under the cursor. This drives a pure-CSS radial-gradient highlight
// (see .spotlight in global.css) without per-card listeners or any
// layout thrashing — the only work per frame is a getBoundingClientRect
// on the single hovered element.
export default function useSpotlight() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return;

    let raf = null;

    function handleMove(e) {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const target = e.target.closest(".spotlight");
        if (!target || !container.contains(target)) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        target.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    }

    container.addEventListener("mousemove", handleMove);
    return () => {
      container.removeEventListener("mousemove", handleMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
