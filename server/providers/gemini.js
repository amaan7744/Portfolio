import { readSSE, readErrorBody } from "./sse.js";

const DEFAULT_MODEL = "gemini-2.0-flash";

// Gemini's request/response shape doesn't match the OpenAI-compatible
// providers (system prompt is a separate `systemInstruction` field, roles
// are "user"/"model" instead of "user"/"assistant", content is nested in
// `parts`), so this one is a standalone implementation rather than going
// through the shared factory.
export const geminiProvider = {
  id: "gemini",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),
  defaultModel: () => process.env.GEMINI_MODEL || DEFAULT_MODEL,

  async streamChat({ system, messages, model, maxTokens }, { onDelta, onDone, onError }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${process.env.GEMINI_API_KEY}`;

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      });
    } catch (err) {
      onError(err);
      return;
    }

    if (!response.ok || !response.body) {
      const detail = await readErrorBody(response);
      onError(new Error(`Gemini API error ${response.status}: ${detail}`));
      return;
    }

    try {
      await readSSE(response, (payload) => {
        const delta = payload.candidates?.[0]?.content?.parts?.[0]?.text;
        if (delta) onDelta(delta);
        if (payload.error) throw new Error(payload.error.message || "Gemini stream error");
      });
      onDone();
    } catch (err) {
      onError(err);
    }
  },
};
