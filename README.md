# Aman Mulani — Portfolio

A multi-page engineering portfolio built as a real software product, not a
single scrolling landing page. React SPA (client-routed) + a small Express
API for the contact form. Every fact on the site — projects, experience,
skills — comes straight from the résumé and GitHub profile; nothing is
invented.

## Stack

- **Frontend:** React 19, React Router, Vite, plain CSS (custom design
  system — no Tailwind/UI kit)
- **Backend:** Node.js + Express (contact form API)
- **APIs:** GitHub REST API (live stats, fetched client-side)
- **SEO:** custom SSR prerendering (no Next.js) — every route is rendered
  to real static HTML at build time via `react-dom/server`, so crawlers and
  AI search engines see full content without executing JS

No framework outside the résumé's listed stack was used (no Next.js,
TypeScript, Tailwind, or ORM).

## Project structure

```
src/
  components/     Nav, CommandPalette, GithubPanel, PipelineDiagram, Seo, ScrollUtils, Footer,
                  ArchitectureDiagram, ServiceFlowDiagram
  data/           content.js — single source of truth for all real content + SEO defaults
  hooks/          useReveal.js — scroll-reveal IntersectionObserver hook
  lib/            schema.js (JSON-LD builders), headStore.js (SSR head capture)
  pages/          Home, Projects, ProjectDetail, Services, ServiceDetail, Dashboard,
                  Experience, Contact, NotFound
  styles/         global.css — design tokens (color, type, spacing)
  entry-server.jsx  SSR entry used only at build time by scripts/prerender.mjs
server/
  index.js        Express API: POST /api/contact, POST /api/assistant, GET /api/health
  assistant.js    Builds the grounding system prompt from src/data/content.js,
                  rate limiting, message sanitization
  providers/      Provider-agnostic LLM layer — groq.js (default), anthropic.js,
                  openai.js, gemini.js, index.js (selects the active one via
                  LLM_PROVIDER env var)
scripts/
  generate-sitemap.mjs  builds public/sitemap.xml from the live route list
  prerender.mjs         renders every route to static HTML after the client build
public/
  Aman_Mulani_Resume.pdf, robots.txt, sitemap.xml, llms.txt, site.webmanifest, _redirects
```

## Running locally

```bash
npm install

# Terminal 1 — frontend (proxies /api to the Express server in dev)
npm run dev

# Terminal 2 — backend (contact form)
npm run server
```

Visit http://localhost:5173. Press Cmd+K / Ctrl+K anywhere to open the
command palette (jump to a page, open a project, copy the email, download
the résumé).

If the Express server isn't running, the contact form still works — it
falls back to opening the visitor's mail client with the message pre-filled.

## Project case studies

Each project page (`ProjectDetail.jsx`) covers: executive summary, requirements,
problem, architecture, API design, database, authentication, infrastructure,
deployment, monitoring, engineering decisions, trade-offs, performance,
scaling, lessons learned, future roadmap, an interactive architecture
diagram, a process timeline, and code-location pointers. The last two are
generated from the same `NODE_DETAILS`/`TRACE_ORDER` data the Architecture
Explorer uses — no separately maintained copy to drift out of sync.
Deliberately **not** included: fabricated screenshots or reconstructed code
snippets. Screenshots would need real image assets that don't exist yet;
"code examples" are real file-path pointers into the actual repo rather than
invented source, since claiming to reproduce code from a repo this tool
hasn't read would misrepresent the actual implementation.

## Architecture Explorer

Each project's diagram (`ArchitectureDiagram.jsx`) supports zoom/pan/focus
mode, category filtering, node search (`arch-search`), and a "Trace a
request" control that sequentially walks a real request/data flow through
the diagram — implemented by reusing the existing node-selection state
rather than a parallel visual system, so it stays in sync with everything
else for free. Every node's documentation panel covers technology, purpose,
decision rationale, alternatives considered, responsibilities, I/O,
dependencies, trade-offs, scaling, performance, security, failure points,
future improvements, code location, and related projects (computed from
real shared tech-stack overlap with the other two case studies, not a
hand-maintained list).

## Services platform

`/services` is an overview with expandable summary cards; each of the 12
services also has its own SEO-optimized detail page at `/services/:id`
(`ServiceDetail.jsx`) with problem/who-it's-for/business value, an example
architecture flow (`ServiceFlowDiagram.jsx` — a generic data-driven diagram,
not a hand-drawn one per service), deliverables, workflow, timeline, FAQs
(with `FAQPage` JSON-LD), related case studies, and suggested follow-up
services. Every service's `relatedProjectSlugs` is checked against real
project slugs at build time implicitly (a stale slug would 404 the link —
none currently do). Where a service doesn't yet map to a shipped project
(e.g. Technical Consulting, Long-term Maintenance), that's stated directly
in its FAQ rather than implied by omission.

## AI assistant ("Ask about Aman")

The floating assistant (Ctrl/Cmd+J) is a real engineering copilot, not a
canned FAQ bot. It's grounded entirely in `src/data/content.js` — the same
resume/project/service data the rest of the site renders from — so it can't
invent facts about work that doesn't exist.

Two-tier design:
1. **Primary:** `POST /api/assistant` streams a response from a **provider-agnostic
   LLM layer** (`server/providers/`) — Groq by default (free tier, fastest),
   with Anthropic, OpenAI, and Gemini fully implemented and swappable via
   `LLM_PROVIDER` env var alone. The frontend never knows which provider is
   active; it only talks to `/api/assistant`. System prompt is built from
   `src/data/content.js` (full project case studies, services, skills,
   experience) — see `server/assistant.js`.
2. **Fallback:** if no provider is configured, or the request fails for any
   reason (offline, static-only hosting, rate limited), the frontend
   transparently falls back to the local keyword-retrieval engine
   (`src/assistant/engine.js`) — the widget never goes silent.

Chat UI (`src/assistant/AssistantPanel.jsx`): real token streaming, markdown
with syntax-highlighted code blocks (`CodeBlock.jsx`) and lazy-loaded Mermaid
diagram rendering (`MermaidBlock.jsx`, only pulled in when a response
actually contains one), stop-generation, regenerate, copy, persisted
history, skeleton/typing states, and dedicated Recruiter/Client quick-action
grids (`QUICK_ACTIONS` in `engine.js`) in addition to context-aware
follow-up suggestions.

To enable the real LLM tier: copy `.env.example` to `.env`, set
`LLM_PROVIDER` and the matching `*_API_KEY`, and run `npm run server`. The
Express process includes a simple in-memory rate limiter (40
requests/hour/IP) since the endpoint is public.

## Building for production

```bash
npm run build
```

This runs, in order: sitemap generation → client build → SSR build →
prerender script. Output lands in `dist/`, with each route as its own
`index.html` (e.g. `dist/projects/movie-booking-platform/index.html`) —
not just one shell page. `npm run build:client-only` skips SSR/prerender if
you ever need a quick CSR-only build.

```bash
npm run preview    # preview the production build locally
```

## Deployment

**Frontend (static):** deploy `dist/` to Vercel or Netlify.
- `vercel.json` and `public/_redirects` (Netlify) are included so unknown
  routes fall back to the SPA shell for client-side routing, while the
  known routes above are served as their own real static files.
- Before deploying, update `site.url` in `src/data/content.js` to the real
  production domain — it feeds canonical URLs, JSON-LD, and the sitemap.

**Backend (contact form):** deploy `server/index.js` anywhere that runs
Node (Render, Railway, a small VM). Point the frontend's `/api/contact`
fetch at that URL in production, or deploy both behind the same domain/proxy.

**GitHub data:** fetched directly from api.github.com in the browser — no
server-side token needed for public data, but GitHub's unauthenticated rate
limit (60 req/hour per IP) applies.

## Real data, no invention

Every number, project, and job on this site is drawn from
`Aman_Mulani_Resume.pdf` / github.com/amaan7744. If something changes on
the resume, update `src/data/content.js` — everything else reads from there.
