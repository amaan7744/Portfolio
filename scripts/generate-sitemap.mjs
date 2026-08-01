import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { projects, services, site } from "../src/data/content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/projects", priority: "0.9", changefreq: "weekly" },
  { path: "/services", priority: "0.9", changefreq: "monthly" },
  { path: "/dashboard", priority: "0.6", changefreq: "daily" },
  { path: "/experience", priority: "0.7", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
];

const projectRoutes = projects.map((p) => ({
  path: `/projects/${p.slug}`,
  priority: "0.8",
  changefreq: "monthly",
}));

const serviceRoutes = services.map((s) => ({
  path: `/services/${s.id}`,
  priority: "0.8",
  changefreq: "monthly",
}));

const routes = [...staticRoutes, ...projectRoutes, ...serviceRoutes];

const body = routes
  .map(
    (r) => `  <url>
    <loc>${site.url}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const outPath = path.join(__dirname, "../public/sitemap.xml");
fs.writeFileSync(outPath, xml);
console.log(`sitemap.xml written with ${routes.length} routes -> ${outPath}`);

export { routes };
