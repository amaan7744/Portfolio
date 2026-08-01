import { anthropicProvider } from "./anthropic.js";
import { groqProvider } from "./groq.js";
import { openaiProvider } from "./openai.js";
import { geminiProvider } from "./gemini.js";

// Provider-agnostic LLM layer. The frontend and the rest of the backend
// (server/assistant.js) only ever talk to `getActiveProvider()` — nothing
// upstream of this file knows or cares which company's API is behind it.
// Switching providers is purely an env var change:
//
//   LLM_PROVIDER=groq        (default — free tier, fastest)
//   LLM_PROVIDER=anthropic
//   LLM_PROVIDER=openai
//   LLM_PROVIDER=gemini
//
// Adding a new provider means adding one file that implements
// { id, isConfigured(), defaultModel(), streamChat(...) } and registering
// it below — nothing else in the app changes.
const PROVIDERS = {
  groq: groqProvider,
  anthropic: anthropicProvider,
  openai: openaiProvider,
  gemini: geminiProvider,
};

export function getActiveProvider() {
  const id = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  return PROVIDERS[id] || null;
}

export function isAssistantConfigured() {
  const provider = getActiveProvider();
  return Boolean(provider?.isConfigured());
}
