import { makeOpenAICompatibleProvider } from "./openaiCompatible.js";

export const openaiProvider = makeOpenAICompatibleProvider({
  id: "openai",
  apiUrl: "https://api.openai.com/v1/chat/completions",
  apiKeyEnv: "OPENAI_API_KEY",
  defaultModel: "gpt-4o-mini",
});
