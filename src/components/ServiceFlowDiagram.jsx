import "./ServiceFlowDiagram.css";

// A deliberately simple, generic flow diagram — not the bespoke
// hand-drawn SVGs used for the three project case studies
// (ArchitectureDiagram.jsx). Services describe a *pattern*, not one real
// running system with a fixed topology, so a numbered horizontal flow
// (built from each service's `architecture` string array) communicates
// the shape without pretending to be a literal system diagram.
export default function ServiceFlowDiagram({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="sfd" role="img" aria-label={`Example architecture flow: ${steps.join(" → ")}`}>
      {steps.map((step, i) => (
        <div className="sfd-step" key={i}>
          <div className="sfd-node">
            <span className="sfd-num">{i + 1}</span>
            <p>{step}</p>
          </div>
          {i < steps.length - 1 && <span className="sfd-arrow" aria-hidden="true">→</span>}
        </div>
      ))}
    </div>
  );
}
