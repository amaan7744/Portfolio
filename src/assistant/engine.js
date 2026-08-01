import { KNOWLEDGE_BASE } from "./knowledgeBase";
import { projects } from "../data/content";

// --- tokenization / scoring -------------------------------------------------
// A plain keyword-overlap scorer. This is the "static data" retrieval layer
// called out in the brief: no embeddings, no external API call, so the
// assistant works with zero configuration and never fabricates an answer
// outside the knowledge base — it just returns the best-scoring entry, or
// an honest "I don't have that" fallback if nothing scores high enough.
//
// Upgrade path: replace `retrieve()`'s body with a real embedding-similarity
// search or a call to the Anthropic API (see anthropic_api_in_artifacts-style
// fetch to /v1/messages) — everything above and below this function
// (context biasing, action buttons, follow-ups, UI) stays the same, because
// the contract is still "query in, { entry, confidence } out".
const STOPWORDS = new Set(["the","a","an","is","are","of","to","in","on","for","and","what","who","how","do","does","did","can","i","me","my","his","him","he","show","tell","about","with","this","that"]);

// Generic vocabulary that shows up across almost every KB entry
// ("architecture", "explain", "project"...) — a lone match on one of
// these shouldn't be enough to confidently pick an entry (that's how
// "Explain the Job Agent architecture" was previously resolving to an
// unrelated real project instead of admitting it doesn't know a
// project by that name). These still count, just at reduced weight.
const GENERIC_TERMS = new Set(["architecture","design","system","explain","diagram","decisions","project","projects","technology","technologies"]);

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreEntry(queryTokens, entry, context) {
  const kbTokens = new Set(tokenize(entry.keywords + " " + entry.title));
  let score = 0;
  for (const qt of queryTokens) {
    const qtWeight = GENERIC_TERMS.has(qt) ? 0.3 : 2;
    for (const kt of kbTokens) {
      if (kt === qt) {
        score += qtWeight;
      } else if (Math.min(kt.length, qt.length) >= 4 && (kt.includes(qt) || qt.includes(kt))) {
        // Only credit substring overlap for reasonably long tokens —
        // short fragments (e.g. "on", "ai") are substrings of almost
        // anything and would otherwise let gibberish queries "match"
        // an unrelated entry by accident.
        score += qtWeight * 0.25;
      }
    }
  }
  // Context bias: if the visitor is on a specific project or service page,
  // nudge matching entries up so an ambiguous "explain this architecture"
  // resolves to what they're actually looking at.
  if (context?.projectSlug && entry.slug === context.projectSlug) score += 3;
  if (context?.serviceId && entry.slug === context.serviceId) score += 3;
  return score;
}

function retrieve(query, context) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return { entry: null, score: 0 };

  let best = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    const s = scoreEntry(queryTokens, entry, context);
    if (s > bestScore) {
      bestScore = s;
      best = entry;
    }
  }
  return { entry: best, score: bestScore };
}

// --- dynamic filters (backend / AI projects) --------------------------------
function backendProjectsAnswer() {
  const backend = projects.filter((p) => /flask|express|node|mongodb|api|sql/i.test(p.stack.join(" ")));
  return (
    "Backend-focused projects:\n\n" +
    backend.map((p) => `- **${p.name}** — ${p.tagline}`).join("\n")
  );
}
function aiProjectAnswer() {
  const ai = projects.find((p) => /whisper|xtts|openai/i.test(p.stack.join(" ")));
  return ai
    ? `**${ai.name}** is the clearest AI experience: it chains OpenAI Whisper (transcription) and Coqui XTTS-v2 (voice synthesis) into an automated pipeline.\n\n${ai.tagline}`
    : "No project in the knowledge base currently demonstrates AI/ML work.";
}

// --- "explain this architecture" context resolution -------------------------
function architectureAnswer(entry) {
  if (!entry?.architecture?.length) return null;
  return `**${entry.title} — architecture**\n\n${entry.architecture.join("\n\n")}`;
}

const GREETING_RE = /^(hi|hey|hello|yo|sup)\b/;

export function answerQuery(rawQuery, context = {}) {
  const query = rawQuery.trim();
  if (!query) return null;

  if (GREETING_RE.test(query.toLowerCase())) {
    return {
      text:
        "Hey — I'm Aman's portfolio assistant. Ask me about his projects, skills, services, or how to get in touch. " +
        (context.projectSlug ? "I can see you're looking at a specific project, so feel free to just ask \"explain this architecture.\"" : ""),
      followUps: ["Who is Aman?", "Show me his projects", "What services does he offer?"],
    };
  }

  const { entry, score } = retrieve(query, context);

  // Nothing matched well enough — be honest instead of guessing.
  if (!entry || score < 1.5) {
    return {
      text:
        "I don't have that in the knowledge base — I only answer from Aman's real resume, projects, services, and skills, so I won't guess. " +
        "Try asking about a specific project, his skills, or how to get in touch.",
      followUps: ["Who is Aman?", "Show me his projects", "What technologies does he specialize in?"],
    };
  }

  // Special dynamic filters
  if (entry.answer === "__FILTER_BACKEND__") {
    return { text: backendProjectsAnswer(), followUps: ["Explain the media pipeline architecture", "What databases has Aman worked with?"] };
  }
  if (entry.answer === "__FILTER_AI__") {
    return { text: aiProjectAnswer(), followUps: ["Explain that architecture", "What challenges came up?"] };
  }

  // "Explain [this/the X] architecture" — prefer the project's real
  // architecture notes over the generic project blurb when the query is
  // clearly asking about architecture specifically.
  if (/architecture|diagram|system design/.test(query.toLowerCase()) && entry.category === "project") {
    const archAnswer = architectureAnswer(entry);
    if (archAnswer) return { text: archAnswer, followUps: entry.followUps || [] };
  }

  return { text: entry.answer, action: entry.action, followUps: entry.followUps || [] };
}

// Dedicated "predefined experiences" — a fuller, curated action set per
// persona, shown as a grid in the empty state (see AssistantPanel.jsx),
// distinct from the smaller rotating follow-up chip strip below.
export const QUICK_ACTIONS = {
  recruiter: [
    "Summarize Aman",
    "Technical strengths",
    "Backend expertise",
    "AI projects",
    "Automation projects",
    "System design experience",
    "Best engineering work",
    "Resume highlights",
    "Generate interview questions",
    "Why hire Aman?",
  ],
  client: [
    "Recommend a service",
    "Explain development process",
    "Suggest technologies",
    "Estimate project phases",
    "Explain architecture",
    "Recommend the right solution",
    "Guide me to contact Aman",
  ],
};

// Suggested opening prompts, mode-aware.
export function suggestedPrompts(mode, context) {
  if (context?.projectSlug) {
    return ["Explain this architecture", "What were the challenges here?", "What's the future roadmap?"];
  }
  if (context?.serviceId) {
    return ["What does the process look like?", "How can I hire Aman?", "Show me a related project"];
  }
  if (mode === "recruiter") {
    return ["Summarize Aman in 30 seconds", "Which projects are production ready?", "Download the resume", "Contact Aman"];
  }
  if (mode === "client") {
    return ["I need an AI automation", "I need a backend API", "I need a full-stack web app", "Contact Aman"];
  }
  return ["Who is Aman?", "Show me backend projects", "What services does he offer?", "Show me his GitHub"];
}
