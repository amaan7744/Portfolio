import { readSSE, readErrorBody } from "./sse.js";

// Groq and OpenAI both expose the same "OpenAI chat completions" wire
// format, so one factory builds both providers instead of duplicating the
// request/parse logic. Any future OpenAI-compatible provider (Together,
// Fireworks, a local vLLM server, etc.) can reuse this too.
export function makeOpenAICompatibleProvider({ id, apiUrl, apiKeyEnv, defaultModel, extraHeaders }) {
  return {
    id,
    isConfigured: () => Boolean(process.env[apiKeyEnv]),
    defaultModel: () => process.env[`${id.toUpperCase()}_MODEL`] || defaultModel,

    async streamChat({ system, messages, model, maxTokens }, { onDelta, onDone, onError }) {
      let response;
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env[apiKeyEnv]}`,
            ...(extraHeaders || {}),
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: [{ role: "system", content: system }, ...messages],
            stream: true,
          }),
        });
      } catch (err) {
        onError(err);
        return;
      }

      if (!response.ok || !response.body) {
        const detail = await readErrorBody(response);
        onError(new Error(`${id} API error ${response.status}: ${detail}`));
        return;
      }

      try {
        await readSSE(response, (payload) => {
          const delta = payload.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
          if (payload.error) throw new Error(payload.error.message || `${id} stream error`);
        });
        onDone();
      } catch (err) {
        onError(err);
      }
    },
  };
}
