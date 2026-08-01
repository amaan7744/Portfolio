// A deliberately small markdown renderer, scoped to what the assistant
// actually produces: **bold**, `code`, [text](url), "- " bullet lists, and
// fenced ```code blocks (including ```mermaid diagrams). No dependency for
// the text-level parsing, and no dangerouslySetInnerHTML for anything
// except the mermaid SVG output (see MermaidBlock.jsx) — everything else
// renders as real React elements built from the authored/streamed text,
// never from raw HTML.

import CodeBlock from "./CodeBlock";
import MermaidBlock from "./MermaidBlock";

function renderInline(text, keyPrefix) {
  const parts = [];
  let remaining = text;
  let idx = 0;
  const pattern = /(\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((.+?)\))/;

  while (remaining.length) {
    const match = remaining.match(pattern);
    if (!match) {
      parts.push(remaining);
      break;
    }
    if (match.index > 0) parts.push(remaining.slice(0, match.index));

    if (match[2] !== undefined) {
      parts.push(<strong key={`${keyPrefix}-b-${idx++}`}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      parts.push(<code key={`${keyPrefix}-c-${idx++}`}>{match[3]}</code>);
    } else if (match[4] !== undefined) {
      const isInternal = match[5].startsWith("/");
      parts.push(
        isInternal ? (
          <a key={`${keyPrefix}-l-${idx++}`} href={match[5]}>{match[4]}</a>
        ) : (
          <a key={`${keyPrefix}-l-${idx++}`} href={match[5]} target="_blank" rel="noopener noreferrer">{match[4]}</a>
        )
      );
    }
    remaining = remaining.slice(match.index + match[0].length);
  }
  return parts;
}

// Splits raw text into alternating prose/code segments on ``` fences.
// A block is only treated as "closed" (i.e. renders as a real code block)
// once the closing fence has actually arrived — an in-progress stream
// with an open, unterminated fence still renders as plain prose so it
// doesn't flash between states while tokens are arriving.
function splitFences(text) {
  const segments = [];
  const fenceRe = /```([\w-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = fenceRe.exec(text))) {
    if (match.index > last) segments.push({ type: "prose", text: text.slice(last, match.index) });
    segments.push({ type: "code", lang: match[1], code: match[2] });
    last = fenceRe.lastIndex;
  }
  if (last < text.length) segments.push({ type: "prose", text: text.slice(last) });
  return segments;
}

function renderProse(text, keyPrefix) {
  const lines = (text || "").split("\n");
  const blocks = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length) {
      blocks.push(
        <ul key={`${keyPrefix}-ul-${key}`}>
          {listBuffer.map((item, i) => <li key={i}>{renderInline(item, `${keyPrefix}-li-${key}-${i}`)}</li>)}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      return;
    }
    flushList(i);
    if (trimmed.length === 0) return;
    const isHeading = /^\d\.\s/.test(trimmed);
    blocks.push(<p key={`${keyPrefix}-p-${i}`} className={isHeading ? "mm-numbered" : undefined}>{renderInline(trimmed, `${keyPrefix}-p-${i}`)}</p>);
  });
  flushList("end");

  return blocks;
}

export default function MiniMarkdown({ text }) {
  const segments = splitFences(text || "");
  return (
    <div className="mm">
      {segments.map((seg, i) =>
        seg.type === "code" ? (
          seg.lang?.toLowerCase() === "mermaid" ? (
            <MermaidBlock key={i} code={seg.code} />
          ) : (
            <CodeBlock key={i} code={seg.code} lang={seg.lang} />
          )
        ) : (
          <div key={i}>{renderProse(seg.text, `s${i}`)}</div>
        )
      )}
    </div>
  );
}
