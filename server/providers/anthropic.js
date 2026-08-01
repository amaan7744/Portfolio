import { readSSE, readErrorBody } from "./sse.js";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

export const anthropicProvider = {
  id: "anthropic",
  isConfigured: () => Boolean(process.env.ANTHROPIC_API_KEY),
  defaultModel: () => process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,

  async streamChat({ system, messages, model, maxTokens }, { onDelta, onDone, onError }) {
    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          system,
          messages, // already [{role, content}] — Anthropic's native shape
          stream: true,
        }),
      });
    } catch (err) {
      onError(err);
      return;
    }

    if (!response.ok || !response.body) {
      const detail = await readErrorBody(response);
      onError(new Error(`Anthropic API error ${response.status}: ${detail}`));
      return;
    }

    try {
      await readSSE(response, (payload) => {
        if (payload.type === "content_block_delta" && payload.delta?.type === "text_delta") {
          onDelta(payload.delta.text);
        } else if (payload.type === "error") {
          throw new Error(payload.error?.message || "Anthropic stream error");
        }
      });
      onDone();
    } catch (err) {
      onError(err);
    }
  },
};
