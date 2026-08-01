// Deliberately small, regex-based highlighter — not a full grammar, but
// covers what an LLM actually outputs in a grounded Q&A context (short
// snippets illustrating a point, not entire files): keywords, strings,
// comments, numbers, function calls. Avoids pulling in a real tokenizer
// library (highlight.js/prism) purely for this, keeping the assistant's
// lazy-loaded chunk small.

const KEYWORD_SETS = {
  js: "const let var function return if else for while switch case break continue class extends new import export from default async await try catch finally throw typeof instanceof of in null undefined true false this super static get set yield".split(" "),
  py: "def return if elif else for while class import from as try except finally raise with yield lambda None True False and or not in is pass break continue self async await global nonlocal".split(" "),
  bash: "if then else elif fi for while do done case esac function return echo export local read set in".split(" "),
  json: "true false null".split(" "),
  css: "@media @import @keyframes from to important inherit initial unset".split(" "),
  html: [],
  sql: "SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER ON GROUP BY ORDER HAVING INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE ALTER DROP AND OR NOT NULL AS LIMIT".split(" "),
};

const ALIASES = {
  javascript: "js", js: "js", jsx: "js", ts: "js", tsx: "js", typescript: "js", node: "js",
  python: "py", py: "py",
  bash: "bash", sh: "bash", shell: "bash", zsh: "bash",
  json: "json",
  css: "css", scss: "css",
  html: "html", xml: "html",
  sql: "sql",
};

export function normalizeLang(lang) {
  const key = (lang || "").trim().toLowerCase();
  return ALIASES[key] || (KEYWORD_SETS[key] ? key : "plain");
}

// Splits a line of code into { text, type } tokens, where type is one of
// "comment" | "string" | "number" | "keyword" | "func" | "plain".
export function tokenizeLine(line, lang) {
  const keywords = new Set(KEYWORD_SETS[lang] || []);
  const tokens = [];
  // Order matters: comments/strings first (they can contain anything),
  // then numbers/identifiers/punctuation.
  const pattern =
    /(\/\/.*$|#.*$|<!--[\s\S]*?-->)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g;

  let last = 0;
  let match;
  while ((match = pattern.exec(line))) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), type: "plain" });
    if (match[1] !== undefined) tokens.push({ text: match[1], type: "comment" });
    else if (match[2] !== undefined) tokens.push({ text: match[2], type: "string" });
    else if (match[3] !== undefined) tokens.push({ text: match[3], type: "number" });
    else if (match[4] !== undefined) tokens.push({ text: match[4], type: "func" });
    else if (match[5] !== undefined) {
      const word = match[5];
      tokens.push({ text: word, type: keywords.has(word) ? "keyword" : "plain" });
    }
    last = pattern.lastIndex;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), type: "plain" });
  return tokens;
}
