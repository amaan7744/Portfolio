import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { routes } from "./generate-sitemap.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist");
const ssrEntry = path.join(__dirname, "../dist-ssr/entry-server.js");

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
const { render } = await import(`file://${ssrEntry}`);

for (const route of routes) {
  const { html, head } = render(route.path);

  const page = template
    .replace(
      /<title>[\s\S]*?<\/title>\s*<meta name="description"[^>]*>/,
      "" // strip the static fallback title/description — Helmet's <head> below replaces them
    )
    .replace("</head>", `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

  const outPath =
    route.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, route.path, "index.html");

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page);
  console.log(`prerendered ${route.path} -> ${path.relative(distDir, outPath)}`);
}

// The SSR-only bundle isn't served — remove it so it doesn't ship to production.
fs.rmSync(path.join(__dirname, "../dist-ssr"), { recursive: true, force: true });

console.log(`\nPrerendered ${routes.length} routes.`);
