import { useEffect } from "react";
import { site } from "../data/content";
import { setHead } from "../lib/headStore";

const MANAGED_ATTR = "data-seo-managed";

/**
 * Centralizes per-page SEO so every route ships unique, correct metadata
 * instead of one static <head> for the whole SPA.
 *
 * - On the server (build-time prerender), it records this page's head data
 *   into a module-level store that scripts/prerender.mjs reads after
 *   rendering, and bakes directly into the static HTML for that route.
 * - In the browser, it imperatively updates document.title and the
 *   relevant <meta>/<link>/<script> tags on mount and whenever the route's
 *   data changes (e.g. navigating between project pages via React Router,
 *   which doesn't reload the page).
 *
 * `jsonLd` accepts a single schema object or an array of them.
 */
export default function Seo({ title, description, path = "/", jsonLd, noindex = false }) {
  const fullTitle = title ? `${title} | Aman Mulani` : site.defaultTitle;
  const desc = description || site.defaultDescription;
  const canonical = `${site.url}${path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  const headData = { fullTitle, desc, canonical, noindex, schemas };

  // Runs during render, including on the server — safe because this is a
  // plain module-level write, not React state, and the build script only
  // ever renders one route at a time.
  setHead(headData);

  useEffect(() => {
    document.title = fullTitle;

    const metaTags = [
      { name: "description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: desc },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "Aman Mulani" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: desc },
      ...(noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ];

    document.querySelectorAll(`meta[${MANAGED_ATTR}]`).forEach((el) => el.remove());
    metaTags.forEach((attrs) => {
      const el = document.createElement("meta");
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      el.setAttribute(MANAGED_ATTR, "true");
      document.head.appendChild(el);
    });

    document.querySelectorAll(`link[rel="canonical"][${MANAGED_ATTR}]`).forEach((el) => el.remove());
    const link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", canonical);
    link.setAttribute(MANAGED_ATTR, "true");
    document.head.appendChild(link);

    document.querySelectorAll(`script[type="application/ld+json"][${MANAGED_ATTR}]`).forEach((el) => el.remove());
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(MANAGED_ATTR, "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullTitle, desc, canonical, noindex, JSON.stringify(schemas)]);

  return null;
}
