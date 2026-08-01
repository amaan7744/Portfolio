// A positioned rect+text node group that behaves like a real node in an
// engineering diagramming tool: hoverable (native <title> tooltip),
// keyboard-focusable, and clickable to open the full engineering
// documentation panel (technology, purpose, trade-offs, scaling,
// failure points, etc). Selection and category-dimming are pure CSS
// state driven by data attributes, so this stays a thin wrapper and
// never touches the hand-tuned x/y/width layout of the diagrams that
// use it.
export default function DiagramNode({ id, label, category, detail, selectedId, activeCategory, onSelect, children }) {
  const selected = selectedId === id;
  const dimmed = Boolean(activeCategory) && activeCategory !== category;
  const summary = detail?.purpose || label;

  const open = () => onSelect?.(id);

  return (
    <g
      className={`node${selected ? " node-selected" : ""}${dimmed ? " node-dimmed" : ""}`}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${label} — ${summary}. Activate to open engineering details.`}
      data-category={category}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
    >
      <title>{summary}</title>
      {children}
    </g>
  );
}
