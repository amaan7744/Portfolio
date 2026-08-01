import { makeOpenAICompatibleProvider } from "./openaiCompatible.js";

// Groq is the default provider: free tier, very low latency, good enough
// quality for a grounded Q&A assistant — the right trade-off for a public
// portfolio demo that needs to stay cheap to run indefinitely.
export const groqProvider = makeOpenAICompatibleProvider({
  id: "groq",
  apiUrl: "https://api.groq.com/openai/v1/chat/completions",
  apiKeyEnv: "GROQ_API_KEY",
  defaultModel: "llama-3.3-70b-versatile",
});
