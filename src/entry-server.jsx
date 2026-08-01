import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App.jsx";
import { getHead } from "./lib/headStore";

export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  const head = getHead();

  const tags = [];
  if (head) {
    tags.push(`<title>${escapeHtml(head.fullTitle)}</title>`);
    tags.push(`<meta name="description" content="${escapeHtml(head.desc)}" />`);
    tags.push(`<link rel="canonical" href="${head.canonical}" />`);
    if (head.noindex) tags.push(`<meta name="robots" content="noindex, nofollow" />`);
    tags.push(`<meta property="og:type" content="website" />`);
    tags.push(`<meta property="og:title" content="${escapeHtml(head.fullTitle)}" />`);
    tags.push(`<meta property="og:description" content="${escapeHtml(head.desc)}" />`);
    tags.push(`<meta property="og:url" content="${head.canonical}" />`);
    tags.push(`<meta property="og:site_name" content="Aman Mulani" />`);
    tags.push(`<meta name="twitter:card" content="summary" />`);
    tags.push(`<meta name="twitter:title" content="${escapeHtml(head.fullTitle)}" />`);
    tags.push(`<meta name="twitter:description" content="${escapeHtml(head.desc)}" />`);
    head.schemas.forEach((schema) => {
      tags.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
    });
  }

  return { html, head: tags.join("\n    ") };
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
