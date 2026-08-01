import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "assistant-messages-v1";

function loadStored() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    // `streaming`/`live` are transient UI flags for an in-progress LLM
    // response. If the tab was closed or reloaded mid-stream, clear them
    // so the restored message reads as a normal, settled reply instead of
    // being stuck "streaming" forever.
    return JSON.parse(raw).map((m) => ({ ...m, streaming: false, live: false }));
  } catch {
    return [];
  }
}

// Conversation history persisted across visits (this is a real deployed
// site, not a sandboxed artifact, so localStorage is the right tool —
// simple, no backend required, and every message here is either the
// visitor's own input or an answer already derived from public data).
export function usePersistedMessages() {
  const [messages, setMessages] = useState(loadStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage can fail (private browsing, quota) — conversation still
      // works for the session, it just won't persist. Non-fatal.
    }
  }, [messages]);

  const clear = () => setMessages([]);

  return [messages, setMessages, clear];
}

// Reveals `text` a few characters at a time, purely as a UI affordance for
// the local knowledge-base fallback engine, which answers synchronously
// and has no real token stream to relay. Real LLM responses (llmClient.js)
// set `message.live = true` and skip this simulation entirely — those
// already arrive incrementally from the actual API stream.
export function useTypewriter(text, { active, speed = 14 } = {}) {
  const [shown, setShown] = useState(active ? "" : text);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    indexRef.current = 0;
    setShown("");
    const id = setInterval(() => {
      indexRef.current += 3;
      setShown(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active]);

  return shown;
}
