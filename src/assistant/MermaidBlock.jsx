import { useEffect, useId, useState } from "react";

// mermaid is a genuinely large dependency, so it's dynamically imported —
// this component (and the module-level cache below) only pay that cost the
// first time the assistant actually outputs a ```mermaid block, not on
// initial load of the assistant panel itself.
let mermaidPromise = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          background: "#14100a",
          primaryColor: "#1c1611",
          primaryTextColor: "#e8ddc9",
          primaryBorderColor: "#3a3226",
          lineColor: "#6b6151",
          secondaryColor: "#221b14",
          fontFamily: "var(--mono, monospace)",
        },
        securityLevel: "strict",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export default function MermaidBlock({ code }) {
  const id = useId().replace(/:/g, "-");
  const [state, setState] = useState({ status: "loading", svg: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => mermaid.render(`mm-${id}`, code))
      .then(({ svg }) => {
        if (!cancelled) setState({ status: "ready", svg, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", svg: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [id, code]);

  if (state.status === "loading") {
    return <div className="mermaid-block mermaid-loading">rendering diagram…</div>;
  }
  if (state.status === "error") {
    // Fall back to the raw source rather than a dead end — the diagram
    // syntax itself is still useful/readable.
    return (
      <div className="mermaid-block mermaid-error">
        <pre>{code}</pre>
      </div>
    );
  }
  return <div className="mermaid-block" dangerouslySetInnerHTML={{ __html: state.svg }} />;
}
