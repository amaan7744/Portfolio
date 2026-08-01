// Small shared helper: reads a fetch Response body as a stream of SSE
// "data: ..." payloads, already split into events and JSON-parsed. Every
// provider's wire format differs in the *payload shape*, but they all use
// the same SSE framing (events separated by a blank line), so this one
// reader is reused instead of four copies of the same buffering logic.
export async function readSSE(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const evt of events) {
      const dataLine = evt.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      const raw = dataLine.slice(5).trim();
      if (raw === "[DONE]") return; // OpenAI-compatible sentinel
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch {
        continue;
      }
      onEvent(payload);
    }
  }
}

export async function readErrorBody(response) {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return "";
  }
}
