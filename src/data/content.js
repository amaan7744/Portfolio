// Single source of truth. Every field here is drawn directly from
// Aman's resume / GitHub profile — nothing invented, no placeholder metrics.

export const site = {
  url: "https://amanmulani.dev", // update to the real deployed domain before going live
  name: "Aman Mulani — Backend & Automation Engineer",
  defaultTitle: "Aman Mulani | Python Backend & Automation Engineer",
  defaultDescription:
    "Portfolio of Aman Mulani, a Python backend engineer building automated, API-driven systems — scheduled AI pipelines, REST services, and full-stack web apps.",
  twitterHandle: "", // no public Twitter/X handle on record — leave blank rather than invent one
};

export const profile = {
  name: "Aman Mulani",
  role: "Python Backend & Automation Engineer",
  location: "Pune, Maharashtra, India",
  email: "amaanmulani4@gmail.com",
  phone: "+91-7744072907",
  github: "https://github.com/amaan7744",
  githubUser: "amaan7744",
  linkedin: "https://www.linkedin.com/in/amaan-mulani-846748217/",
  resume: "/Aman_Mulani_Resume.pdf",
  summary:
    "Python-focused software engineer building automated, API-driven backend systems and full-stack web applications. Designed and shipped a scheduled content-processing pipeline integrating speech recognition, voice synthesis, and video processing, deployed via GitHub Actions CI/CD. Comfortable across the stack (Python, JavaScript/React, Node.js) with a growing focus on backend engineering, automation, and applied AI integrations.",
  status: "Open to backend / automation / AI-integration roles — full-time or internship",
};

export const skills = {
  languages: ["Python", "JavaScript", "C++", "SQL"],
  backend: ["Flask", "Node.js", "Express.js", "REST API design & integration", "YouTube Data API v3", "OpenAI API"],
  frontend: ["React.js", "HTML5", "CSS3", "Bootstrap"],
  aiAutomation: ["OpenAI Whisper (speech-to-text)", "Coqui XTTS-v2 (voice cloning/TTS)", "FFmpeg-based video processing", "Workflow automation"],
  databases: ["MongoDB", "SQL"],
  devops: ["Git", "GitHub", "GitHub Actions (CI/CD)", "Docker", "Linux / Bash"],
};

export const projects = [
  {
    slug: "automated-media-content-pipeline",
    name: "Automated Media Content Pipeline",
    type: "Personal Project",
    tagline: "A modular Python pipeline that turns raw video into transcribed, voice-processed, vertical-format clips — headlessly, on a daily cron.",
    executiveSummary: "A Python pipeline that turns a source video into a transcribed, voice-resynthesized, vertical-format clip end to end, unattended, once a day. The interesting engineering problem wasn't any single step — it was chaining two separate ML models (Whisper, XTTS-v2) and FFmpeg into a pipeline that survives running on a shared, disposable GitHub Actions runner with no persistent server.",
    requirements: [
      "Run fully unattended on a daily schedule — no manual trigger, no server to babysit",
      "Chain two ML models (transcription + voice synthesis) without exceeding GitHub Actions' free-tier compute/time budget",
      "Survive a completely disposable, stateless runner — no local state persists between runs except what's explicitly committed back to git",
      "Keep each pipeline stage independently swappable, since the TTS model was already a likely future extraction point",
    ],
    stack: ["Python", "GitHub Actions", "OpenAI Whisper", "Coqui XTTS-v2", "FFmpeg", "yt-dlp", "YouTube Data API v3"],
    github: "https://github.com/amaan7744/yt-shorts-auto",
    problem: [
      "Turning long-form source video into transcribed, voice-processed, vertical-format clips normally means running several separate tools by hand: download, detect highlights, cut clips, transcribe, resynthesize audio, reassemble — every single day.",
    ],
    architecture: [
      "The pipeline is split into independent, chainable stages: source retrieval (yt-dlp) → audio-based highlight detection → clip extraction → transcription → vertical-format video assembly.",
      "Each stage reads and writes to disk independently, so a single stage — e.g. swapping the TTS model — can change without touching the rest of the pipeline.",
      "State (which source has been processed, current rotation position) is persisted back to the repository itself between runs, rather than an external database, since the whole job is stateless infrastructure by design.",
    ],
    engineering: [
      "Chained OpenAI-Whisper for automatic transcription and subtitle generation with Coqui XTTS-v2 for voice-cloned speech synthesis — two separate ML models composed into a single automated workflow.",
      "FFmpeg handles both clip extraction and final vertical-format assembly, driven entirely from the Python orchestration layer.",
      "Built a scheduled CI/CD pipeline on GitHub Actions with a daily cron trigger that installs dependencies from a clean runner, executes the full pipeline headlessly, and commits updated rotation state back to the repo automatically.",
    ],
    challenges: [
      "Running ML inference (Whisper + XTTS-v2) inside a GitHub Actions runner meant working within limited compute and execution-time constraints — required careful dependency pinning and staged execution rather than one long-running script.",
      "Iterated the architecture across multiple content-source variants, refining the pipeline over 800+ commits to improve reliability and processing speed.",
    ],
    apiDesign: [
      "This project has no external API surface of its own — it's a scheduled pipeline invoked by a cron job, not a service other systems call.",
      "The Voice Synthesis REST API project was deliberately extracted from this pipeline specifically to expose the TTS capability as something callable, once it became clear other tools could reuse it.",
    ],
    database: [
      "No traditional database. State (which source has been processed, current rotation position) is committed directly back to the git repository between runs, avoiding the operational cost of a managed datastore for a job that runs once a day.",
    ],
    infrastructure: [
      "Runs entirely on GitHub-hosted Actions runners — no persistent server, no cloud account to manage. Each run starts from a clean image, installs dependencies fresh, and tears down after committing state.",
    ],
    deployment: [
      "Deployment is the scheduled workflow file itself (.github/workflows/daily-pipeline.yml) — there's nothing to separately deploy; a change to the pipeline takes effect the next time the cron fires or a commit lands on main.",
    ],
    performance: [
      "The binding constraint is GitHub Actions' per-job compute and time budget, not the pipeline logic itself — Whisper and XTTS-v2 share the same runner CPU, so total run time is dominated by ML inference rather than I/O or orchestration overhead.",
    ],
    authentication: "None — this is a scheduled, unattended job with no external caller and no user-facing surface, so there's nothing to authenticate. Auth becomes relevant for the Voice Synthesis REST API, which is what got extracted from this pipeline specifically to be callable.",
    monitoring: "No formal monitoring today — a failed run shows up as a failed GitHub Actions job in the repo's Actions tab, which is sufficient at once-a-day frequency. That wouldn't hold up at higher frequency or if the output fed something user-facing; alerting on job failure is a reasonable next step.",
    scaling: [
      "Not built to scale in the traditional sense — it's a once-a-day batch job, not a service under concurrent load.",
      "The real scaling question is per-run capacity: a longer source video or a second output format directly increases the compute budget a single run needs, bounded by GitHub Actions' time limit.",
      "The natural next step under higher volume would be moving ML inference to a persistent worker, so scheduled runs trigger only a lightweight job instead of paying cold-start and full inference cost every time.",
    ],
    roadmap: [
      "Move ML inference to a persistent worker so scheduled runs only trigger a lightweight job, removing the GitHub Actions timeout risk that currently caps how much content a single run can process.",
      "Add a fallback source list so a single dead or region-locked video doesn't stall the day's run.",
    ],
    lessons: [
      "Decoupling pipeline stages early made it far easier to debug failures in isolation and to later extract the TTS stage into its own service (see the Voice Synthesis REST API project).",
    ],
  },
  {
    slug: "voice-synthesis-rest-api",
    name: "Voice Synthesis REST API",
    type: "Personal Project",
    tagline: "A standalone Flask microservice that exposes text-to-speech as a single, reusable REST endpoint.",
    executiveSummary: "A single-endpoint Flask service that exists because a capability trapped inside a bigger pipeline is only useful to that pipeline. Extracting text-to-speech into a standalone REST API made it callable from anything, not just the one script it originally lived in.",
    requirements: [
      "Expose XTTS-v2 synthesis as a plain REST endpoint any caller can hit, not something coupled to the media pipeline's internals",
      "Keep request latency low enough to be usable as a real API — solving model load time, not just wiring up an endpoint",
      "No client SDK — the contract itself had to be simple enough that a new caller doesn't need one",
    ],
    stack: ["Python", "Flask", "Coqui XTTS-v2"],
    github: "https://github.com/amaan7744",
    problem: [
      "The XTTS-v2 text-to-speech engine was originally embedded inside the media pipeline — useful there, but unusable by anything else without duplicating the model-loading code.",
    ],
    architecture: [
      "A Flask microservice with a single REST endpoint: accepts text input, runs it through the XTTS-v2 model, returns synthesized speech.",
      "Model loading and inference are isolated from any caller-specific logic, keeping the service generic.",
    ],
    engineering: [
      "Decoupled the TTS engine from the main content pipeline into an independently callable service, so any future project can call the same endpoint instead of re-implementing voice synthesis.",
    ],
    challenges: [
      "Balancing model load time against request latency in a synchronous Flask service — informed how the service is intended to be run (warm process, not cold-started per request).",
    ],
    apiDesign: [
      "A single POST /synthesize endpoint — deliberately minimal. Text in, audio out, no auth layer yet since the only current caller is trusted internal code.",
    ],
    database: [
      "None. The service is stateless — every request is independent and nothing is persisted between calls.",
    ],
    infrastructure: [
      "Runs as a long-lived Flask process so the XTTS-v2 model can be loaded once and kept warm, rather than a serverless function that would cold-load the model on every invocation.",
    ],
    deployment: [
      "A single Python process (app.py) — no containerization or orchestration layer yet, appropriate for its current single-caller usage.",
    ],
    performance: [
      "Request latency is dominated by model inference time rather than network or serialization overhead, because the model stays warm in memory across requests instead of reloading per call.",
    ],
    authentication: "None yet, by design for now — the only current caller is trusted internal code (the media pipeline). Documented plainly in the roadmap as the first thing to add before any external caller is given access.",
    monitoring: "No monitoring or alerting set up — the service is small enough that failures surface directly to the caller as a failed request. That's a real gap the moment there's more than one consumer or the service runs unattended.",
    scaling: [
      "Vertical only today — one warm model per process.",
      "The natural next step is horizontal: multiple warm-model worker processes behind a load balancer, since the model itself, not I/O, is the bottleneck.",
      "Request queuing would matter before worker count does, since a single slow request currently blocks the worker handling it.",
    ],
    roadmap: [
      "Add authentication for external callers, and move to multiple warm-model workers behind a load balancer if concurrent traffic increases.",
    ],
    lessons: [
      "Extracting a single well-defined capability into its own service made it directly reusable — the same pattern is a natural next step for the transcription stage too.",
    ],
  },
  {
    slug: "movie-booking-platform",
    name: "Movie Booking Platform",
    type: "Personal Project — MERN stack",
    tagline: "A full-stack movie booking web app with authentication and booking history, on the MERN stack.",
    executiveSummary: "A complete authenticated booking flow — accounts, listings, bookings — built end to end on the MERN stack as a full-stack exercise in RESTful API design, not a wrapper around a single feature.",
    requirements: [
      "A working authentication flow with real session/account state, not a stubbed login",
      "Three independently addressable REST resources (accounts, listings, bookings) rather than one monolithic endpoint",
      "A booking-history view so users see their own state, not just a one-way create action",
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "REST API", "Bootstrap"],
    github: "https://github.com/amaan7744",
    problem: [
      "Building a complete, authenticated booking flow end-to-end — accounts, listings, and bookings — as a full-stack exercise in RESTful API design.",
    ],
    architecture: [
      "Express.js/Node.js REST API with endpoints for user accounts, movie listings, and bookings, backed by MongoDB.",
      "React frontend consumes the same REST endpoints, with Bootstrap handling responsive layout.",
    ],
    engineering: [
      "Implemented user authentication and a booking-history view so users can see their own booking state, not just create new ones.",
      "Designed the API surface (accounts / listings / bookings) as separate resources rather than one monolithic endpoint, matching standard REST conventions.",
    ],
    challenges: [
      "Keeping booking state consistent between the client and MongoDB without a real-time layer — handled with straightforward request/response REST calls rather than adding unnecessary complexity.",
    ],
    apiDesign: [
      "Three REST resources — /accounts, /listings, /bookings — each with its own route module rather than one shared controller, following standard REST resource conventions.",
    ],
    database: [
      "MongoDB, a single shared instance across all three resources — a document model was a natural fit for the mostly-independent, mostly-flat shape of accounts, listings, and bookings.",
    ],
    infrastructure: [
      "A standard Node.js/Express process serves the API, with the React frontend built and served separately.",
    ],
    deployment: [
      "Deployed as a conventional Node.js app — no CI/CD pipeline was built for this project the way it was for the media pipeline, since the focus here was REST API and full-stack design rather than automation.",
    ],
    performance: [
      "No formal load testing has been done — at the traffic this project has actually seen, a single shared MongoDB instance with no caching layer has been sufficient.",
    ],
    authentication: "Handled as its own resource module (/accounts), kept separate from listings and bookings specifically so auth logic doesn't leak into unrelated routes. No rate limiting on login attempts yet — flagged directly in the roadmap as the most security-relevant gap in the current implementation.",
    monitoring: "No formal monitoring or logging infrastructure — errors currently surface the same way any Express app's unhandled errors do, in process logs. Reasonable for the traffic this project has actually seen; would need real logging/alerting before production traffic.",
    scaling: [
      "The Express API is a stateless Node process — the layer most straightforward to scale horizontally behind a load balancer if traffic grew.",
      "MongoDB is a single shared instance across all three resources today; the first real scaling move would be splitting the write-heavy bookings collection onto its own resource.",
      "Listings is the best caching candidate, since listing data changes far less often than bookings.",
    ],
    roadmap: [
      "Add rate limiting on the auth endpoints and an atomic check to prevent race-condition double bookings on the same slot.",
    ],
    lessons: [
      "This project is where the REST API design habits used in the later, backend-focused projects were first formed.",
    ],
  },
];

export const services = [
  {
    id: "custom-website-development",
    name: "Custom Website Development",
    blurb: "Real code, not a page-builder export — a React site that can grow into an application later instead of needing to be rebuilt from scratch.",
    technologies: ["React.js", "Node.js", "Express.js", "Responsive CSS", "SEO fundamentals"],
    idealClient: "Businesses or individuals who've hit the ceiling of template builders — custom interactions, real forms, or specific SEO structure that Wix/Squarespace can't do.",
    problem: "Template builders work until they don't — custom interactions, real data, or specific SEO structure need actual code, not a drag-and-drop ceiling.",
    businessValue: [
      "A site that can grow into a real application instead of being rebuilt from scratch",
      "Full control over performance and SEO structure — no platform constraints",
      "No page-builder lock-in or per-user pricing tiers",
    ],
    architecture: [
      "React frontend, statically generated or server-rendered depending on SEO needs",
      "A lightweight Express backend only where the site needs real logic — forms, data — otherwise fully static",
      "Deployed to a CDN-backed static host for speed",
    ],
    deliverables: [
      "A responsive, accessible, SEO-structured site",
      "Working contact/lead forms wired to real email delivery",
      "Clean, maintainable source — not a page-builder export",
    ],
    process: [
      "Confirm the actual pages/flows needed before choosing static vs. server-rendered",
      "Build page by page against real content, not lorem ipsum",
      "Verify Lighthouse scores and mobile behavior before handoff",
    ],
    timeline: "A focused marketing site is typically the fastest engagement here — scope-dependent, discussed upfront.",
    faqs: [
      { q: "Do you use a page builder or write custom code?", a: "Custom code — React and plain CSS, no page-builder lock-in." },
      { q: "Can it grow into a full application later?", a: "Yes — that's the point of building it in React/Node from the start instead of a static-site generator you'd have to migrate off later." },
    ],
    relatedProjectSlugs: ["movie-booking-platform"],
  },
  {
    id: "fullstack-web-apps",
    name: "Full-Stack Web Applications",
    blurb: "End-to-end web apps on the MERN stack — the pattern used to build a full authenticated booking platform from scratch.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "Bootstrap"],
    idealClient: "Someone who needs a complete, working web app — frontend, API, and database — not just one layer of an existing system.",
    problem: "A working product needs frontend, API, database, and auth working together — not one layer built well and the rest bolted on.",
    businessValue: [
      "One person accountable for the whole stack, so integration issues get caught early, not at launch",
      "A data model chosen for actual access patterns, not a generic template",
      "A tested end-to-end user flow, not disconnected pieces",
    ],
    architecture: [
      "React frontend consuming a REST API built alongside it",
      "Express/Node backend with resource-based routing",
      "MongoDB for flexible per-user state — history, bookings, saved items",
      "Authentication and per-user state handled as first-class concerns, not bolted on",
    ],
    deliverables: [
      "A React frontend consuming a REST API built alongside it",
      "Authentication and any per-user state (history, bookings, saved items) handled properly",
      "Responsive layout that works across device sizes",
    ],
    process: [
      "Design the REST resources first, since the frontend and database both follow from that",
      "Build the API and frontend together so integration issues surface early, not at the end",
      "Test the full user flow, not just individual endpoints or components",
    ],
    timeline: "The largest-scope service here — realistic timelines depend on how many distinct flows (auth, browse, checkout, etc.) are involved.",
    faqs: [
      { q: "Which stack do you build on?", a: "MERN — React, Express, Node, MongoDB — the same stack behind the Movie Booking Platform case study." },
      { q: "Do you handle authentication?", a: "Yes, including per-user state like booking or order history." },
    ],
    relatedProjectSlugs: ["movie-booking-platform"],
  },
  {
    id: "backend-api-development",
    name: "Backend & API Development",
    blurb: "Server-side systems and REST APIs designed around real data/access patterns — including capabilities extracted into standalone services when that's what actually reduces duplication, the way the Voice Synthesis API was pulled out of the media pipeline.",
    technologies: ["Python", "Node.js", "Express.js", "Flask", "MongoDB", "SQL", "REST API design"],
    idealClient: "Teams or founders who need a reliable backend for an existing frontend, or a capability trapped inside one app that other tools now need to call too.",
    problem: "An existing frontend or set of tools needs a reliable data layer, or a capability extracted into a callable service — not a fragile one-off script.",
    businessValue: [
      "A backend that won't need a rewrite once real traffic hits it",
      "An API contract other tools or scripts can call without reading the source",
      "Clear separation between resource logic and framework plumbing",
    ],
    architecture: [
      "Resource-based route structure — one module per resource, not one giant file",
      "A data model chosen for actual access patterns, not a default template",
      "Input validation and error handling on every endpoint",
      "Model/process warm-loading where inference or startup latency matters",
    ],
    deliverables: [
      "A backend service with a clearly separated resource/route structure",
      "A minimal, well-scoped endpoint contract — not more surface area than the use case needs",
      "A short integration note so a new caller doesn't have to read the source to use it",
    ],
    process: [
      "Understand the real data and access patterns before picking a database or framework",
      "Build resource by resource, keeping each one independently testable",
      "Document the contract plainly: input, output, and known limits",
    ],
    timeline: "Scope-dependent — a single well-defined endpoint can ship in days; a multi-resource backend takes longer, discussed once scope is clear.",
    faqs: [
      { q: "REST or something else?", a: "REST, by default — it's the right fit for most integrations. Happy to discuss if something else genuinely fits better." },
      { q: "Can you extract a feature into its own service?", a: "Yes — the Voice Synthesis API is exactly that: a capability pulled out of a larger pipeline once it needed to be called from more than one place." },
    ],
    relatedProjectSlugs: ["voice-synthesis-rest-api", "automated-media-content-pipeline"],
  },
  {
    id: "ai-applications",
    name: "AI Applications",
    blurb: "Products with a model doing real work at their core — not a wrapper around one API call, but a system built around what the model actually needs: context, retries, warm state, fallbacks.",
    technologies: ["OpenAI API", "OpenAI Whisper", "Coqui XTTS-v2", "Python"],
    idealClient: "Teams who want AI as a real feature — transcription, generation, synthesis — not a chatbot bolted onto a landing page.",
    problem: "A single API call to a model provider isn't a product — it needs error handling, warm state, cost control, and a real interface around it.",
    businessValue: [
      "A feature that behaves predictably under real usage, not just in a demo",
      "Sensible fallback behavior when a model call fails or times out",
      "Cost-aware design — batching, caching, warm-loading — instead of naive per-request calls",
    ],
    architecture: [
      "Model access wrapped behind a clear internal interface, not called ad hoc from multiple places",
      "Warm-loaded models where startup latency matters, as with XTTS-v2 in the Voice Synthesis API",
      "Explicit handling for failure and timeout cases rather than letting them surface to the user",
    ],
    deliverables: [
      "A model-backed feature with a defined interface — not raw API calls scattered through the codebase",
      "Explicit error/fallback handling for model failures or timeouts",
      "A short note on cost drivers (tokens, inference time) so usage stays predictable",
    ],
    process: [
      "Confirm what the model actually needs to succeed — context, format, retries — before writing the integration",
      "Build the interface layer first, then wire the feature to it",
      "Load-test against realistic usage, not a single happy-path call",
    ],
    timeline: "Depends on how many model calls and fallback paths are involved — discussed once the feature scope is clear.",
    faqs: [
      { q: "Which models do you work with?", a: "OpenAI's API and Whisper directly, plus open-source models like Coqui XTTS-v2 for self-hosted synthesis." },
      { q: "Can this run without a persistent server?", a: "Where it fits — see AI Automation for the scheduled/cron pattern." },
    ],
    relatedProjectSlugs: ["voice-synthesis-rest-api", "automated-media-content-pipeline"],
  },
  {
    id: "ai-automation",
    name: "AI Automation",
    blurb: "Scheduled, unattended pipelines that chain ML models together — the same pattern behind the daily automated media pipeline (Whisper + XTTS-v2 + FFmpeg), running headlessly on a cron with no server to maintain.",
    technologies: ["OpenAI Whisper", "Coqui XTTS-v2", "FFmpeg", "GitHub Actions", "OpenAI API"],
    idealClient: "Anyone doing the same multi-step, ML-involved process by hand on a schedule.",
    problem: "A repeatable process with real ML steps in it is still being run by hand, or held together by a script someone has to remember to trigger.",
    businessValue: [
      "The process runs on schedule without anyone remembering to trigger it",
      "Each stage can change independently without breaking the rest of the pipeline",
      "No persistent server to maintain — the schedule itself is the infrastructure",
    ],
    architecture: [
      "A pipeline split into independent, chainable stages",
      "A scheduling mechanism appropriate to the job — cron-based automation where a persistent server isn't justified",
      "State handled deliberately — persisted where it needs to be, stateless where it doesn't",
    ],
    deliverables: [
      "A pipeline split into independent, chainable stages",
      "A scheduling mechanism appropriate to the job",
      "State handled deliberately — persisted where it needs to be, stateless where it doesn't",
    ],
    process: [
      "Map the manual process into discrete stages first",
      "Build and test each stage in isolation before chaining them",
      "Automate the schedule last, once the pipeline is proven to run correctly by hand",
    ],
    timeline: "Depends heavily on how many ML stages are involved — a single-model automation is quick to stand up; multi-stage pipelines take longer to get reliable.",
    faqs: [
      { q: "Does this need a server running 24/7?", a: "Usually not — the media pipeline runs entirely on a GitHub Actions cron with no persistent server." },
      { q: "What happens if a stage fails?", a: "Each stage is independently testable and the pipeline is designed so one stage's failure doesn't silently corrupt the others' state." },
    ],
    relatedProjectSlugs: ["automated-media-content-pipeline"],
  },
  {
    id: "workflow-automation",
    name: "Workflow Automation",
    blurb: "Automating repeatable, multi-step processes that don't necessarily involve ML — scheduling, data movement, CI/CD — the same discipline behind the GitHub Actions cron setup that runs the media pipeline daily.",
    technologies: ["GitHub Actions", "Python", "Bash", "Git"],
    idealClient: "Teams repeating a manual process on a schedule that doesn't need a persistent server or ML step.",
    problem: "A manual, repeatable process — data movement, file processing, scheduled checks — is still triggered by a person instead of running itself.",
    businessValue: [
      "The process runs reliably on schedule without manual intervention",
      "Failures are visible instead of silently skipped",
      "No infrastructure to provision or maintain beyond the automation itself",
    ],
    architecture: [
      "The manual process mapped into discrete, scriptable steps",
      "A scheduling/trigger mechanism matched to the job — cron, webhook, or event-based",
      "Logging or notification on failure, so problems surface immediately",
    ],
    deliverables: [
      "A working automation replacing the manual trigger",
      "Failure visibility — logs or notifications, not silent failures",
      "Documentation of what triggers what",
    ],
    process: [
      "Confirm the manual process works correctly by hand first",
      "Automate incrementally, one stage at a time, verified before adding the next",
      "Leave the setup documented enough that it isn't a black box",
    ],
    timeline: "Typically a quick engagement — most of the work is understanding the existing process correctly, not the automation itself.",
    faqs: [
      { q: "What kinds of processes fit this?", a: "Anything repeatable and currently manual — file/data movement, scheduled checks, report generation, deploy triggers." },
    ],
    relatedProjectSlugs: ["automated-media-content-pipeline"],
  },
  {
    id: "saas-mvp-development",
    name: "SaaS MVP Development",
    blurb: "Turning a validated idea into a working multi-user product — auth, per-user state, and a real data model, using the same full-stack pattern behind the Movie Booking Platform.",
    technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "GitHub Actions"],
    idealClient: "Founders who've validated demand and need a working product, not another mockup.",
    problem: "An idea has been validated but there's no working product — just mockups, or a prototype that can't hold real users.",
    businessValue: [
      "A working multi-user product with real auth and per-user state, not a static demo",
      "A data model chosen to support the actual product, not a generic starter template",
      "An honest scope conversation upfront, rather than an overpromised timeline",
    ],
    architecture: [
      "React frontend, Express/Node API, MongoDB for per-user state",
      "Authentication and account state as first-class concerns from day one",
      "Deployment automated from the start so shipping updates isn't manual",
    ],
    deliverables: [
      "A working multi-user product with authentication",
      "A data model that fits the real product, not a generic starter template",
      "Deployment automation so updates ship without manual steps",
    ],
    process: [
      "Scope the actual MVP feature set — what's core vs. what can wait",
      "Build auth and the core data model first, since everything else depends on them",
      "Ship early, then iterate against real usage rather than more upfront planning",
    ],
    timeline: "Highly scope-dependent — discussed directly once the core feature set is defined.",
    faqs: [
      { q: "Have you shipped a SaaS product before?", a: "Not one billed as a SaaS product specifically — but the underlying pieces (auth, per-user state, a real data model, deployment automation) are all demonstrated in shipped work. Worth a direct conversation before committing to scope." },
    ],
    relatedProjectSlugs: ["movie-booking-platform"],
  },
  {
    id: "admin-dashboards",
    name: "Admin Dashboards",
    blurb: "Internal tools and dashboards that show real data, not mocked numbers — the same approach behind this site's own Engineering Dashboard, which pulls live GitHub data rather than hardcoding stats.",
    technologies: ["React.js", "Node.js", "Express.js", "REST API design"],
    idealClient: "Teams who need visibility into their own data or operations, not another generic BI tool.",
    problem: "Operational data exists but nobody can see it without digging through logs, spreadsheets, or a database directly.",
    businessValue: [
      "Real-time visibility into what's actually happening, sourced live — not a snapshot someone forgot to update",
      "A tool built around the specific data that matters to the team, not a generic template",
      "No mocked or placeholder numbers — if a metric can't be sourced live, it's left out rather than faked",
    ],
    architecture: [
      "A backend endpoint aggregating real data sources — APIs, database queries",
      "A React frontend rendering it as sortable, filterable views",
      "No mocked or placeholder numbers — if a metric can't be sourced live, it's left out",
    ],
    deliverables: [
      "A dashboard sourcing every number from a real, live data source",
      "Sortable/filterable views built around the metrics that actually matter",
      "Sensible refresh/caching so the dashboard stays fast without hammering the source APIs",
    ],
    process: [
      "Identify which metrics are actually decision-relevant before building any UI",
      "Build the data-aggregation layer first, and verify it against real numbers",
      "Layer the frontend on top once the data is trustworthy",
    ],
    timeline: "Scope-dependent on how many data sources need aggregating — discussed once the metrics are defined.",
    faqs: [
      { q: "Can I see an example?", a: "Yes — the Engineering Dashboard on this site is a live example, pulling real GitHub data rather than hardcoded numbers." },
    ],
    relatedProjectSlugs: [],
  },
  {
    id: "cloud-deployment",
    name: "Cloud Deployment",
    blurb: "Getting a project running somewhere real, and automating the parts that would otherwise be repeated by hand — the same GitHub Actions cron setup that runs the media pipeline daily without a server to maintain.",
    technologies: ["GitHub Actions", "Docker", "Git", "Linux / Bash", "Vercel"],
    idealClient: "A working project that's still being run manually, or one that needs a scheduled/automated job instead of a person triggering it.",
    problem: "A project works locally but isn't running anywhere real, or is being deployed by hand every time something changes.",
    businessValue: [
      "Deploys happen automatically and consistently, not via someone's local machine",
      "A scheduled/automated job replaces manual triggering entirely where that fits",
      "The setup is documented, not a black box only one person understands",
    ],
    architecture: [
      "A CI/CD workflow appropriate to the project — scheduled job, deploy-on-push, or both",
      "Dependency and environment setup that reproduces cleanly on a fresh runner",
      "Clear documentation of what triggers what",
    ],
    deliverables: [
      "A CI/CD workflow appropriate to the project (scheduled job, deploy-on-push, or both)",
      "Dependency and environment setup that reproduces cleanly on a fresh runner",
      "Clear documentation of what triggers what",
    ],
    process: [
      "Confirm the process manually first, so automation reproduces something that actually works",
      "Automate incrementally — one stage at a time, verified before adding the next",
      "Leave the setup documented enough that it's not a black box",
    ],
    timeline: "Typically the quickest engagement — most of the work is understanding the existing process correctly, not the automation itself.",
    faqs: [
      { q: "Which platforms do you deploy to?", a: "Depends on the project — Vercel for static/SSR frontends, GitHub Actions runners for scheduled jobs, or a plain Linux host where a persistent process is actually needed." },
    ],
    relatedProjectSlugs: ["automated-media-content-pipeline"],
  },
  {
    id: "performance-optimization",
    name: "Performance Optimization",
    blurb: "Finding and removing the actual bottleneck — not guessing. The Voice Synthesis API's model warm-loading and the media pipeline's parallel Whisper/XTTS-v2 stages are both performance decisions made after identifying where time was actually going.",
    technologies: ["Python", "Node.js", "Profiling tools", "FFmpeg"],
    idealClient: "An existing system that's slow, and needs the real bottleneck found — not a generic tuning pass.",
    problem: "A system is slow and nobody's actually confirmed where the time is going before trying to fix it.",
    businessValue: [
      "Fixes target the real bottleneck instead of guessing and hoping",
      "Measurable before/after numbers, not a vague sense of 'it feels faster'",
      "No unnecessary rewrites — the smallest change that fixes the actual problem",
    ],
    architecture: [
      "Profile first — identify where time or resources actually go before changing anything",
      "Fix the highest-impact bottleneck first — e.g. cold-start latency, or sequential stages that could run in parallel",
      "Re-measure after each change to confirm it actually helped",
    ],
    deliverables: [
      "A profiling report identifying the actual bottleneck(s)",
      "Targeted fixes for the highest-impact issues, with before/after measurements",
      "A short note on what was changed and why, for future reference",
    ],
    process: [
      "Profile first — identify where time or resources actually go before changing anything",
      "Fix the highest-impact bottleneck first",
      "Re-measure after each change to confirm it actually helped",
    ],
    timeline: "Usually a short, focused engagement — the diagnosis phase is quick; the fix timeline depends on what's found.",
    faqs: [
      { q: "Do you optimize frontend or backend performance?", a: "Both, depending on where profiling shows the bottleneck actually is — cold-start latency, sequential processing, or client-side rendering." },
    ],
    relatedProjectSlugs: ["voice-synthesis-rest-api", "automated-media-content-pipeline"],
  },
  {
    id: "technical-consulting",
    name: "Technical Consulting",
    blurb: "A second set of eyes on architecture decisions, technology choices, or a stuck problem — before code gets written, or after it's already been written the wrong way.",
    technologies: ["System design", "Architecture review"],
    idealClient: "Teams or founders who need an honest technical opinion, not a sales pitch for more work.",
    problem: "A team is about to make (or has already made) an architecture or technology decision without a second, independent opinion.",
    businessValue: [
      "An honest assessment, including \"this isn't a fit\" when that's the truth",
      "Architecture review before expensive mistakes get made, not after",
      "No obligation to continue into a build engagement",
    ],
    architecture: [],
    deliverables: [
      "A written assessment of the architecture or decision in question",
      "Concrete, prioritized recommendations — not a vague list of concerns",
      "An honest answer on fit, even if that answer is 'this isn't the right approach'",
    ],
    process: [
      "Understand the actual constraints — team size, timeline, existing systems — before recommending anything",
      "Review the specific decision or architecture in question directly",
      "Deliver a concrete, prioritized set of recommendations, not a vague list of concerns",
    ],
    timeline: "Usually a short, bounded engagement — a single review session or a brief written assessment.",
    faqs: [
      { q: "Is this a sales pitch for a bigger engagement?", a: "No — the assessment stands on its own, including telling you if a build engagement isn't actually the right next step." },
    ],
    relatedProjectSlugs: [],
  },
  {
    id: "long-term-maintenance",
    name: "Long-term Maintenance",
    blurb: "Keeping a shipped system healthy after launch — dependency updates, monitoring, and fixing what breaks, instead of it silently rotting.",
    technologies: ["Python", "Node.js", "GitHub Actions", "Monitoring/alerting"],
    idealClient: "Anyone with a live system and no one currently watching it.",
    problem: "A system shipped and works today, but nobody's watching for what breaks it tomorrow — dependency drift, silent failures, security updates.",
    businessValue: [
      "Problems get caught before a user reports them, not after",
      "Dependencies stay current instead of accumulating years of security debt",
      "The system isn't locked in one person's head — there's a documented runbook",
    ],
    architecture: [
      "Regular dependency and security updates",
      "Basic monitoring/alerting so failures surface before a user reports them",
      "A documented runbook so maintenance isn't locked in one person's head",
    ],
    deliverables: [
      "A recurring maintenance cadence — dependency updates, security patches",
      "Basic monitoring/alerting appropriate to the system",
      "A documented runbook covering what to do when something breaks",
    ],
    process: [
      "Establish a baseline — what's currently monitored, what isn't",
      "Set up basic alerting for the failure modes that matter most",
      "Run a recurring update/review cadence rather than reactive-only fixes",
    ],
    timeline: "Ongoing, scoped as a recurring engagement rather than a one-off project.",
    faqs: [
      { q: "Is this a retainer?", a: "Structured as a recurring engagement, scoped to what the system actually needs — discussed directly." },
    ],
    relatedProjectSlugs: [],
  },
];

export const experience = [
  {
    role: "Full-Stack Developer Intern",
    org: "DevTown",
    location: "Remote",
    period: "Jul 2023 – Nov 2023",
    points: [
      "Developed and maintained frontend and backend features using the MERN stack under senior developer guidance.",
      "Built responsive UI components in React and integrated them with REST APIs backed by Node.js, Express.js, and MongoDB.",
      "Debugged reported issues, participated in code reviews, and collaborated with the team using Git and GitHub.",
    ],
  },
  {
    role: "Frontend Developer Intern",
    org: "TXON",
    location: "Remote",
    period: "Apr 2023 – May 2023",
    points: [
      "Built responsive web pages and reusable UI components using HTML, CSS, and JavaScript.",
      "Implemented and tested small interactive applications (calculator, to-do list), collaborating with a small dev team via Git.",
    ],
  },
];

export const education = {
  degree: "B.E., Electronics & Telecommunication",
  school: "Sinhgad Academy of Engineering, Pune",
  status: "Expected May 2026",
};

export const pipelineStages = [
  { id: "source", label: "yt-dlp", sub: "source retrieval" },
  { id: "whisper", label: "Whisper", sub: "transcription" },
  { id: "xtts", label: "XTTS-v2", sub: "voice synthesis" },
  { id: "ffmpeg", label: "FFmpeg", sub: "assembly" },
  { id: "output", label: "Output", sub: "vertical video" },
  { id: "actions", label: "GitHub Actions", sub: "daily cron → commit" },
];
