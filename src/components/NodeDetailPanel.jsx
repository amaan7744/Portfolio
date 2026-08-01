import { useEffect, useRef } from "react";

// Renders the selected node's engineering documentation — the same
// shape of information a new engineer would want from an internal
// architecture wiki: what it is, why it exists, why this technology
// over the alternatives, what it depends on, how it fails, and where
// the code lives. Pure presentation; all content is passed in via the
// `node` prop assembled in ArchitectureDiagram.

function Row({ term, value, list, code }) {
  if (!value || (list && value.length === 0)) return null;
  return (
    <div className="node-panel-row">
      <dt>{term}</dt>
      {list ? (
        <dd><ul>{value.map((v, i) => <li key={i}>{v}</li>)}</ul></dd>
      ) : code ? (
        <dd><code>{value}</code></dd>
      ) : (
        <dd>{value}</dd>
      )}
    </div>
  );
}

export default function NodeDetailPanel({ node, onClose, relatedProjects }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (node) closeRef.current?.focus();
  }, [node]);

  useEffect(() => {
    if (!node) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, onClose]);

  if (!node) return null;
  const d = node.detail;

  return (
    <aside className="node-panel" role="dialog" aria-modal="false" aria-label={`${node.label} engineering documentation`}>
      <div className="node-panel-head">
        <div>
          <span className="node-panel-eyebrow">{node.category}</span>
          <h3>{node.label}</h3>
        </div>
        <button ref={closeRef} className="node-panel-close" onClick={onClose} aria-label="Close engineering details">×</button>
      </div>

      <dl className="node-panel-body">
        <Row term="Technology" value={d.technology} />
        <Row term="Purpose" value={d.purpose} />
        <Row term="Why this choice" value={d.decision} />
        <Row term="Alternatives considered" value={d.alternatives} />
        <Row term="Responsibilities" value={d.responsibilities} list />
        <Row term="Input" value={d.input} />
        <Row term="Output" value={d.output} />
        <Row term="Dependencies" value={d.dependencies} list />
        <Row term="Trade-offs" value={d.tradeoffs} />
        <Row term="Scaling strategy" value={d.scaling} />
        <Row term="Performance considerations" value={d.performance} />
        <Row term="Security considerations" value={d.security} />
        <Row term="Failure points" value={d.failurePoints} />
        <Row term="Future improvements" value={d.future} />
        <Row term="Code location" value={d.code} code />
      </dl>

      {relatedProjects?.length > 0 && (
        <div className="node-panel-related">
          <span className="node-panel-eyebrow">Related projects</span>
          <ul>
            {relatedProjects.map((p) => (
              <li key={p.slug}>
                <a href={`/projects/${p.slug}`}>{p.name}</a>
                <span>{p.sharedTech.join(", ")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
