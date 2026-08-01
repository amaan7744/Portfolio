import { useState } from "react";
import { normalizeLang, tokenizeLine } from "./highlight";

const TOKEN_CLASS = {
  comment: "cb-comment",
  string: "cb-string",
  number: "cb-number",
  keyword: "cb-keyword",
  func: "cb-func",
  plain: undefined,
};

export default function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  const normalized = normalizeLang(lang);
  const lines = code.replace(/\n$/, "").split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied — non-fatal
    }
  };

  return (
    <div className="cb-block">
      <div className="cb-header">
        <span className="cb-lang">{lang || "text"}</span>
        <button type="button" className="cb-copy" onClick={copy} aria-label="Copy code">
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="cb-pre">
        <code>
          {lines.map((line, i) => (
            <span className="cb-line" key={i}>
              {tokenizeLine(line, normalized).map((tok, j) =>
                TOKEN_CLASS[tok.type] ? (
                  <span key={j} className={TOKEN_CLASS[tok.type]}>{tok.text}</span>
                ) : (
                  <span key={j}>{tok.text}</span>
                )
              )}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
