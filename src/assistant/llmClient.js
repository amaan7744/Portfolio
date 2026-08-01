// Thin client for POST /api/assistant — reads the streamed plain-text
// response body and hands chunks to the caller as they arrive. No SSE
// parsing needed here; the server already flattens Anthropic's event
// stream into plain text (see server/assistant.js).
//
// Any failure (network error, 4xx/5xx, server not deployed at all — e.g.
// a static-only hosting target with no backend) rejects, and the caller
// (AssistantPanel) falls back to the local keyword-retrieval engine so
// the assistant never goes silent.

export async function streamAssistant({ messages, mode, context }, { onDelta, signal }) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, mode, context }),
    signal,
  });

  if (!res.ok || !res.body) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.error || "";
    } catch {
      // non-JSON error body — ignore, status code is enough
    }
    throw new Error(`assistant request failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) continue;
    full += chunk;
    onDelta(chunk, full);
  }

  if (!full.trim()) {
    throw new Error("assistant returned an empty response");
  }

  return full;
}
