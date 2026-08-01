// Real LLM backend for the portfolio's "Ask about Aman" assistant.
//
// Design goals (matches the constraints the rest of this project already
// follows): no invented facts, graceful degradation, no heavy dependencies.
// The entire knowledge the model is allowed to draw on is serialized here
// from the same src/data/content.js used to render the rest of the site —
// there is no second "assistant facts" source to drift out of sync.
//
// If no provider is configured (see providers/index.js), isConfigured()
// reports false and the frontend falls back to the original local
// keyword-retrieval engine (src/assistant/engine.js) — the assistant still
// works, just without the LLM. Nothing about that fallback path changes here.

import { profile, skills, projects, services, experience, education, site } from "../src/data/content.js";
import { getActiveProvider, isAssistantConfigured } from "./providers/index.js";

const MAX_TOKENS = 700;

export function isConfigured() {
  return isAssistantConfigured();
}

function projectBrief(p) {
  return [
    `### ${p.name} (${p.type})`,
    `Slug: ${p.slug}`,
    `Tagline: ${p.tagline}`,
    p.executiveSummary ? `Executive summary: ${p.executiveSummary}` : null,
    `Stack: ${p.stack.join(", ")}`,
    `GitHub: ${p.github}`,
    p.requirements?.length ? `Requirements:\n${p.requirements.join(" ")}` : null,
    p.problem?.length ? `Problem:\n${p.problem.join(" ")}` : null,
    p.architecture?.length ? `Architecture:\n${p.architecture.join(" ")}` : null,
    p.engineering?.length ? `Engineering decisions:\n${p.engineering.join(" ")}` : null,
    p.apiDesign?.length ? `API design:\n${p.apiDesign.join(" ")}` : null,
    p.database?.length ? `Database:\n${p.database.join(" ")}` : null,
    p.authentication ? `Authentication: ${p.authentication}` : null,
    p.infrastructure?.length ? `Infrastructure:\n${p.infrastructure.join(" ")}` : null,
    p.deployment?.length ? `Deployment:\n${p.deployment.join(" ")}` : null,
    p.monitoring ? `Monitoring: ${p.monitoring}` : null,
    p.challenges?.length ? `Challenges & trade-offs:\n${p.challenges.join(" ")}` : null,
    p.performance?.length ? `Performance:\n${p.performance.join(" ")}` : null,
    p.scaling?.length ? `Scaling:\n${p.scaling.join(" ")}` : null,
    p.roadmap?.length ? `Future roadmap:\n${p.roadmap.join(" ")}` : null,
    p.lessons?.length ? `Lessons learned:\n${p.lessons.join(" ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function serviceBrief(s) {
  return [
    `### ${s.name}`,
    `Id: ${s.id}`,
    `Blurb: ${s.blurb}`,
    `Technologies: ${s.technologies.join(", ")}`,
    `Ideal client: ${s.idealClient}`,
    s.problem ? `Problem it solves: ${s.problem}` : null,
    s.businessValue?.length ? `Business value: ${s.businessValue.join("; ")}` : null,
    s.architecture?.length ? `Example architecture: ${s.architecture.join(" -> ")}` : null,
    `Deliverables: ${s.deliverables.join("; ")}`,
    `Process: ${s.process.join(" -> ")}`,
    `Timeline: ${s.timeline}`,
    s.faqs?.length ? `FAQs:\n${s.faqs.map((f) => `Q: ${f.q} A: ${f.a}`).join("\n")}` : null,
    s.relatedProjectSlugs?.length ? `Related shipped projects: ${s.relatedProjectSlugs.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function experienceBrief(e) {
  return `### ${e.role} — ${e.org} (${e.period}, ${e.location})\n${e.points.join(" ")}`;
}

// Built once per process start — the underlying data only changes on a
// redeploy, so there's no need to rebuild this string per request.
function buildKnowledgeBlock() {
  return [
    "## Profile",
    `Name: ${profile.name}`,
    `Role: ${profile.role}`,
    `Location: ${profile.location}`,
    `Status: ${profile.status}`,
    `Summary: ${profile.summary}`,
    `Email: ${profile.email}`,
    `GitHub: ${profile.github}`,
    `LinkedIn: ${profile.linkedin}`,
    `Resume file: ${profile.resume}`,
    "",
    "## Education",
    `${education.degree}, ${education.school} — ${education.status}`,
    "",
    "## Skills",
    `Languages: ${skills.languages.join(", ")}`,
    `Backend: ${skills.backend.join(", ")}`,
    `Frontend: ${skills.frontend.join(", ")}`,
    `AI / Automation: ${skills.aiAutomation.join(", ")}`,
    `Databases: ${skills.databases.join(", ")}`,
    `DevOps: ${skills.devops.join(", ")}`,
    "",
    "## Work experience",
    ...experience.map(experienceBrief),
    "",
    "## Projects (full engineering case studies)",
    ...projects.map(projectBrief),
    "",
    "## Services offered",
    ...services.map(serviceBrief),
  ].join("\n");
}

let cachedKnowledgeBlock = null;
function knowledgeBlock() {
  if (!cachedKnowledgeBlock) cachedKnowledgeBlock = buildKnowledgeBlock();
  return cachedKnowledgeBlock;
}

const MODE_INSTRUCTIONS = {
  recruiter:
    "The visitor identified themselves as a recruiter/hiring manager. Lead with hireability signals: seniority level implied by the work, production-readiness, and how quickly Aman could contribute. Keep it skimmable.",
  client:
    "The visitor identified themselves as a potential client. Frame answers around what problem gets solved, realistic scope/timeline, and which service maps to what they need. Be direct about fit — if something isn't a match, say so plainly rather than oversell.",
  general:
    "The visitor hasn't specified a persona yet. Answer naturally, and infer intent from what they ask.",
};

export function buildSystemPrompt({ mode, context } = {}) {
  const modeNote = MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.general;
  const contextNote = context?.projectSlug
    ? `The visitor is currently viewing the "${context.projectSlug}" project page. If they ask something ambiguous like "explain this architecture," assume they mean this project.`
    : context?.serviceId
      ? `The visitor is currently viewing the "${context.serviceId}" service page. Bias ambiguous questions toward this service.`
      : context?.page
        ? `The visitor is currently on the "${context.page}" page of the site. Bias ambiguous questions toward that page's subject matter.`
        : "The visitor is not on a specific project or service page right now.";

  return [
    `You are the engineering assistant embedded in ${profile.name}'s portfolio site (${site.url}). You are a copilot that explains ${profile.name}'s real engineering work — not a generic chatbot.`,
    "Ground every answer strictly in the knowledge block below. It is the complete, real source of truth (resume, shipped projects with full architecture notes, services, skills, experience) — nothing outside it is true about Aman's work.",
    "If something isn't covered by the knowledge block, say plainly that you don't have that detail instead of guessing or inventing numbers, dates, or technologies.",
    "Explain engineering decisions the way a principal engineer would review them: what was chosen, what the trade-off was, and why it fit the constraints — not a marketing summary.",
    "Write in markdown: short paragraphs, **bold** for key terms, bullet lists where they help scannability. Keep answers focused — a few short paragraphs or a tight list, not an essay, unless the visitor explicitly asks for depth.",
    modeNote,
    contextNote,
    "",
    "=== KNOWLEDGE BLOCK ===",
    knowledgeBlock(),
    "=== END KNOWLEDGE BLOCK ===",
  ].join("\n");
}

// --- rate limiting -----------------------------------------------------
// Minimal in-memory fixed-window limiter, keyed by IP. This process is
// deployed as a single long-lived Node server (see README), so an
// in-memory map is sufficient — no external store needed for this scale.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;
const buckets = new Map();

export function checkRateLimit(ip) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { allowed: true };
}

// Occasionally sweep expired buckets so this doesn't grow unbounded on a
// long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(ip);
  }
}, WINDOW_MS).unref?.();

// --- provider-agnostic streaming call -----------------------------------
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 2000;

function sanitizeHistory(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];
  return rawMessages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.text.slice(0, MAX_MESSAGE_CHARS) }));
}

// Streams the model's text deltas to `onDelta` as they arrive, and calls
// `onDone`/`onError` at the end. Delegates the actual API call to whichever
// provider is active (see providers/index.js) — this function and
// everything that calls it has no idea which LLM company is behind the
// response.
export async function streamAssistantReply({ history, mode, context }, { onDelta, onDone, onError }) {
  const messages = sanitizeHistory(history);
  if (messages.length === 0) {
    onError(new Error("No valid messages provided"));
    return;
  }
  // Every provider requires the message list to start with a "user" turn.
  while (messages.length && messages[0].role !== "user") messages.shift();

  const provider = getActiveProvider();
  if (!provider || !provider.isConfigured()) {
    onError(new Error("No configured LLM provider"));
    return;
  }

  await provider.streamChat(
    {
      system: buildSystemPrompt({ mode, context }),
      messages,
      model: provider.defaultModel(),
      maxTokens: MAX_TOKENS,
    },
    { onDelta, onDone, onError }
  );
}
