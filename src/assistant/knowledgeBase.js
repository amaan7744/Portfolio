// The assistant's entire knowledge base — built directly from the same
// data/content.js used to render the rest of the site. There is no
// separate "assistant facts" file to drift out of sync with the real
// resume/project data, and no invented numbers or claims: every field
// below traces back to profile/skills/projects/services/experience.
//
// Each entry is a small retrievable document: keywords for matching,
// a short markdown-ish answer, and optional follow-up prompts. This
// is intentionally plain data (not a vector index) — see engine.js
// for why, and for how this upgrades to a real embedding/LLM search
// later without changing this file's shape.

import { profile, skills, projects, services, experience, education } from "../data/content";

function projectKb(p) {
  const isMlProject = /whisper|xtts|openai|ai/i.test(p.stack.join(" "));
  return {
    id: `project:${p.slug}`,
    category: "project",
    slug: p.slug,
    title: p.name,
    keywords: [p.name, p.type, ...p.stack, p.slug.replace(/-/g, " "), "project"].join(" ").toLowerCase(),
    isBackend: /flask|express|node|mongodb|api|sql/i.test(p.stack.join(" ")),
    isAi: isMlProject,
    isFullstack: /react/i.test(p.stack.join(" ")) && /express|flask|node/i.test(p.stack.join(" ")),
    answer:
      `**${p.name}** (${p.type})\n\n${p.tagline}\n\n` +
      `Stack: ${p.stack.join(", ")}.\n\n` +
      `${p.problem?.[0] || ""}`,
    architecture: p.architecture || [],
    apiDesign: p.apiDesign || [],
    database: p.database || [],
    challenges: p.challenges || [],
    performance: p.performance || [],
    roadmap: p.roadmap || [],
    lessons: p.lessons || [],
    github: p.github,
    followUps: [`Explain ${p.name}'s architecture`, `What were the challenges in ${p.name}?`, "What's the future roadmap for this?"],
  };
}

function serviceKb(s) {
  return {
    id: `service:${s.id}`,
    category: "service",
    slug: s.id,
    title: s.name,
    keywords: [s.name, s.blurb, ...s.technologies].join(" ").toLowerCase(),
    answer:
      `**${s.name}**\n\n${s.blurb}\n\n` +
      `Technologies: ${s.technologies.join(", ")}.\n\n` +
      `Ideal client: ${s.idealClient}\n\n` +
      `Timeline: ${s.timeline}`,
    deliverables: s.deliverables,
    process: s.process,
    action: { type: "link", href: `/services/${s.id}`, label: `See ${s.name}` },
    followUps: [`What does the ${s.name} process look like?`, "How can I hire Aman?", "Show me a related project"],
  };
}

export const KNOWLEDGE_BASE = [
  {
    id: "who-is-aman",
    category: "profile",
    title: "Who is Aman?",
    keywords: "who is aman mulani about background summary bio",
    answer:
      `**${profile.name}** — ${profile.role}, based in ${profile.location}.\n\n${profile.summary}\n\n${profile.status}.`,
    followUps: ["What technologies does Aman specialize in?", "Show me his projects", "How can I hire him?"],
  },
  {
    id: "skills-overview",
    category: "skills",
    title: "Technologies and skills",
    keywords: "technologies skills tech stack languages specialize expertise",
    answer:
      `**Languages:** ${skills.languages.join(", ")}\n\n` +
      `**Backend:** ${skills.backend.join(", ")}\n\n` +
      `**Frontend:** ${skills.frontend.join(", ")}\n\n` +
      `**AI / Automation:** ${skills.aiAutomation.join(", ")}\n\n` +
      `**Databases:** ${skills.databases.join(", ")}\n\n` +
      `**DevOps:** ${skills.devops.join(", ")}`,
    followUps: ["Show me backend projects", "Which project demonstrates AI experience?", "What APIs has Aman built?"],
  },
  {
    id: "apis-built",
    category: "skills",
    title: "APIs built",
    keywords: "what apis has aman built rest api endpoints",
    answer:
      "Aman has built REST APIs at two different scopes:\n\n" +
      "- A **single-endpoint microservice** (Voice Synthesis REST API) — a Flask service exposing text-to-speech as one POST endpoint.\n" +
      "- A **multi-resource REST API** (Movie Booking Platform) — an Express.js API split into /accounts, /listings, and /bookings resources, backed by MongoDB.\n\n" +
      "He's also integrated third-party APIs: the YouTube Data API v3 and the OpenAI API.",
    followUps: ["Explain the Voice Synthesis API architecture", "What databases has Aman worked with?"],
  },
  {
    id: "databases",
    category: "skills",
    title: "Databases",
    keywords: "database databases mongodb sql worked with",
    answer:
      `Aman has worked with **${skills.databases.join(" and ")}**. MongoDB backs the Movie Booking Platform's three resources; the media pipeline and voice API deliberately use no database at all — state either gets committed to git or isn't persisted, since neither job needed one.`,
    followUps: ["Explain the MERN project's database design", "Show me backend projects"],
  },
  {
    id: "automation-systems",
    category: "skills",
    title: "Automation systems",
    keywords: "automation systems created workflow automation ci cd cron",
    answer:
      "The main automation system is the **Automated Media Content Pipeline** — a scheduled GitHub Actions workflow that runs daily, chaining source retrieval, highlight detection, transcription (Whisper), voice synthesis (XTTS-v2), and video assembly (FFmpeg), then commits its own state back to the repo. No server runs 24/7; the automation exists entirely as a CI/CD job.",
    followUps: ["Explain the Job Agent architecture", "What challenges came up building this?"],
  },
  {
    id: "backend-projects",
    category: "filter",
    title: "Backend projects",
    keywords: "backend projects show me server side",
    answer: "__FILTER_BACKEND__",
  },
  {
    id: "ai-project",
    category: "filter",
    title: "AI experience project",
    keywords: "ai experience project which demonstrates machine learning ml",
    answer: "__FILTER_AI__",
  },
  {
    id: "services-overview",
    category: "services",
    title: "Services offered",
    keywords: "services offer what does aman offer hire for",
    answer:
      `Aman offers ${services.length} services, each grounded in real, demonstrated engineering work: ` +
      services.map((s) => `**${s.name}**`).join(", ") + ".\n\nMost map directly to a shipped project; where one doesn't yet, that's stated plainly on the service page. Real deliverables and scope-dependent timelines — no fixed pricing, no generic agency menu.",
    followUps: services.slice(0, 3).map((s) => `Tell me about ${s.name}`),
  },
  {
    id: "how-to-hire",
    category: "action",
    title: "How to hire Aman",
    keywords: "how can i hire aman contact reach out engage work with",
    answer:
      `The fastest way is the [Contact page](/contact) — describe what you're building and Aman will say plainly whether it's a fit. You can also reach him directly at ${profile.email}.`,
    action: { type: "link", href: "/contact", label: "Open Contact page" },
    followUps: ["What services does Aman offer?", "Download the resume"],
  },
  {
    id: "resume",
    category: "action",
    title: "Resume",
    keywords: "download resume cv",
    answer: "Here's the resume, ready to download.",
    action: { type: "download", href: profile.resume, label: "Download resume (PDF)" },
    followUps: ["Who is Aman?", "Show me his GitHub"],
  },
  {
    id: "github",
    category: "action",
    title: "GitHub",
    keywords: "open github repositories repos source code",
    answer: `Aman's GitHub is [github.com/${profile.githubUser}](${profile.github}) — the Dashboard page also shows live repo activity and language breakdown pulled from the GitHub API.`,
    action: { type: "external", href: profile.github, label: "Open GitHub" },
    followUps: ["Show the engineering dashboard", "Show me his projects"],
  },
  {
    id: "linkedin",
    category: "action",
    title: "LinkedIn",
    keywords: "open linkedin profile",
    answer: `Here's Aman's LinkedIn: [${profile.linkedin}](${profile.linkedin})`,
    action: { type: "external", href: profile.linkedin, label: "Open LinkedIn" },
  },
  {
    id: "contact-info",
    category: "action",
    title: "Contact information",
    keywords: "contact information email phone reach",
    answer: `**Email:** ${profile.email}\n**Phone:** ${profile.phone}\n**Location:** ${profile.location}\n**GitHub:** ${profile.github}\n**LinkedIn:** ${profile.linkedin}`,
    action: { type: "link", href: "/contact", label: "Open Contact page" },
  },
  {
    id: "education",
    category: "profile",
    title: "Education",
    keywords: "education degree school university college",
    answer: `${education.degree} — ${education.school} (${education.status}).`,
  },
  {
    id: "experience-overview",
    category: "experience",
    title: "Work experience",
    keywords: "experience internship work history jobs devtown txon",
    answer: experience
      .map((e) => `**${e.role}** at ${e.org} (${e.period})\n${e.points[0]}`)
      .join("\n\n"),
    followUps: ["Show me his projects", "What technologies does he specialize in?"],
  },
  // Recruiter-mode specific entries
  {
    id: "recruiter-summary",
    category: "recruiter",
    title: "30-second summary",
    keywords: "summarize aman 30 seconds quick summary elevator pitch",
    answer:
      `${profile.name} — ${profile.role}. Built a daily-automated ML pipeline (Whisper + XTTS-v2 + FFmpeg) running unattended in GitHub Actions, extracted a reusable TTS REST API from it, and shipped a full MERN booking platform with auth. Comes from two full-stack/frontend internships. ${profile.status}.`,
  },
  {
    id: "recruiter-strongest-backend",
    category: "recruiter",
    title: "Strongest backend skills",
    keywords: "strongest backend skills strengths what is he best at",
    answer:
      `Backend-wise, the strongest signal is the media pipeline: composing two ML models (Whisper, XTTS-v2) with FFmpeg into a single automated workflow, running unattended on a schedule with no persistent server. That's paired with straightforward REST API design (Flask, Express.js) and MongoDB/SQL for data. Languages: ${skills.languages.join(", ")}.`,
  },
  {
    id: "recruiter-production-ready",
    category: "recruiter",
    title: "Which projects are production ready?",
    keywords: "production ready which projects live deployed",
    answer:
      "Being direct about this rather than overstating it: the **Automated Media Content Pipeline** is the one actually running unattended in production today — it executes on a real daily schedule via GitHub Actions. The **Voice Synthesis REST API** and **Movie Booking Platform** are complete, working personal projects, but neither is deployed to serve live external traffic right now.",
  },
  {
    id: "recruiter-system-design",
    category: "recruiter",
    title: "System design experience",
    keywords: "system design experience architecture design decisions",
    answer:
      "The clearest system-design signal is the media pipeline's stage decomposition — independent, chainable stages (retrieval → detection → extraction → transcription/synthesis → assembly) with state committed to git instead of a database, and the deliberate later extraction of the TTS stage into its own service once reuse became obvious. See the architecture explorer on each project page for the full node-by-node breakdown.",
    followUps: ["Explain the media pipeline architecture", "Generate technical interview questions"],
  },
  {
    id: "recruiter-differentiator",
    category: "recruiter",
    title: "What makes him different",
    keywords: "different from other candidates unique differentiator stand out",
    answer:
      "Two things worth noting rather than claiming outright: the media pipeline is a real, currently-running scheduled system (not a tutorial project), and the case studies here document real trade-offs and unresolved gaps (missing rate limiting, no persistent inference worker yet) rather than presenting everything as finished — the kind of honesty that's easy to check against the actual commit history.",
  },
  {
    id: "recruiter-interview-summary",
    category: "recruiter",
    title: "Interview summary",
    keywords: "generate interview summary candidate summary for panel",
    answer:
      `**Candidate:** ${profile.name}\n**Target roles:** ${profile.status}\n\n` +
      `**Core strengths:** Python backend development, REST API design, ML pipeline orchestration (Whisper, XTTS-v2), GitHub Actions CI/CD, MERN full-stack.\n\n` +
      `**Notable project:** Automated Media Content Pipeline — a real, scheduled production system, not a one-off script.\n\n` +
      `**Background:** Two internships (DevTown — full-stack MERN; TXON — frontend), B.E. in Electronics & Telecommunication (${education.status}).\n\n` +
      `**Worth probing in interview:** how he'd evolve the media pipeline off GitHub Actions if it needed to run more than once a day, and how he'd add auth/rate-limiting to the two APIs he's built.`,
  },
  {
    id: "recruiter-interview-questions",
    category: "recruiter",
    title: "Technical interview questions",
    keywords: "generate technical interview questions based on projects",
    answer:
      "A few real, project-grounded questions:\n\n" +
      "1. Why commit pipeline state to git instead of using a database — what would force you to change that?\n" +
      "2. The Voice Synthesis API keeps the XTTS-v2 model warm in one process — how would you scale that to handle concurrent requests?\n" +
      "3. The media pipeline runs Whisper and XTTS-v2 on the same GitHub Actions runner — what's the actual bottleneck, and how would you remove the timeout risk?\n" +
      "4. The booking platform has no double-booking guard yet — how would you prevent a race condition on the same slot?\n" +
      "5. Why extract the TTS stage into its own REST API instead of leaving it inside the pipeline?",
  },
  // Client-mode specific entries — map a stated need to the closest real service, honestly
  {
    id: "client-ecommerce",
    category: "client",
    title: "E-commerce website need",
    keywords: "need an ecommerce website online store shop",
    answer:
      "Closest match: **Full-Stack Web Applications** (React/Node/Express/MongoDB) plus **Backend & API Development** for the data model. The Movie Booking Platform demonstrates the same shape of problem — accounts, browsable listings, and a booking/purchase flow with history — which is structurally similar to a storefront + orders system.",
    action: { type: "link", href: "/services/fullstack-web-apps", label: "See Full-Stack Web Applications" },
    followUps: ["What's the development process?", "How can I hire Aman?"],
  },
  {
    id: "client-ai-automation",
    category: "client",
    title: "AI automation need",
    keywords: "need an ai automation automate process with ai",
    answer:
      "This is the **AI Automation** service — directly demonstrated by the daily media pipeline chaining Whisper, XTTS-v2, and FFmpeg on a schedule with no persistent server. If your process is a repeatable, multi-step job with real ML steps in it (especially one currently done by hand), this is the closest fit.",
    action: { type: "link", href: "/services/ai-automation", label: "See AI Automation" },
    followUps: ["What's the development process?", "Explain the media pipeline architecture"],
  },
  {
    id: "client-saas-mvp",
    category: "client",
    title: "SaaS MVP need",
    keywords: "need a saas mvp minimum viable product startup app",
    answer:
      "Being upfront: a full SaaS product hasn't shipped under that label yet — the closest overlapping experience is a complete full-stack app (React + Express + MongoDB with auth and per-user state, from the Movie Booking Platform) combined with API design and CI/CD automation experience. That covers the core building blocks an MVP needs; worth a direct conversation about scope before committing to a timeline.",
    action: { type: "link", href: "/services/saas-mvp-development", label: "See SaaS MVP Development" },
  },
  {
    id: "client-backend-api",
    category: "client",
    title: "Backend API need",
    keywords: "need a backend api rest service endpoint",
    answer:
      "This is the **Backend & API Development** service — the Voice Synthesis REST API is a direct example: a minimal, well-scoped endpoint contract extracted from a larger system specifically to be reusable.",
    action: { type: "link", href: "/services/backend-api-development", label: "See Backend & API Development" },
  },
  {
    id: "client-dashboard",
    category: "client",
    title: "Dashboard need",
    keywords: "need a dashboard analytics admin panel",
    answer:
      "The Engineering Dashboard on this site is a working example of the pattern — live data (GitHub API), real metrics derived from actual project data, no mocked numbers. That combination of **Backend & API Development** + **Admin Dashboards** is the fit for a dashboard build.",
    action: { type: "link", href: "/services/admin-dashboards", label: "See Admin Dashboards" },
  },
  ...projects.map(projectKb),
  ...services.map(serviceKb),
];

export const PROJECT_SLUGS = projects.map((p) => p.slug);
export const SERVICE_IDS = services.map((s) => s.id);
