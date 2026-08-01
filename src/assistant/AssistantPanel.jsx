import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { answerQuery, suggestedPrompts, QUICK_ACTIONS } from "./engine";
import { PROJECT_SLUGS, SERVICE_IDS } from "./knowledgeBase";
import { streamAssistant } from "./llmClient";
import { usePersistedMessages, useTypewriter } from "./useAssistant";
import MiniMarkdown from "./MiniMarkdown";
import "./Assistant.css";

const MODES = [
  { id: "general", label: "General" },
  { id: "recruiter", label: "Recruiter" },
  { id: "client", label: "Client" },
];

function useAssistantContext() {
  const location = useLocation();
  return useMemo(() => {
    const projectMatch = location.pathname.match(/^\/projects\/([^/]+)/);
    const slug = projectMatch ? projectMatch[1] : null;
    if (slug && PROJECT_SLUGS.includes(slug)) return { projectSlug: slug };

    const serviceMatch = location.pathname.match(/^\/services\/([^/]+)/);
    const serviceId = serviceMatch ? serviceMatch[1] : null;
    if (serviceId && SERVICE_IDS.includes(serviceId)) return { serviceId };

    if (location.pathname === "/services") return { page: "services" };
    if (location.pathname === "/experience") return { page: "experience" };
    if (location.pathname === "/dashboard") return { page: "dashboard" };
    return {};
  }, [location.pathname]);
}

function MessageBubble({ message, isLatest, onRegenerate, canRegenerate }) {
  const shown = useTypewriter(message.text, {
    active: isLatest && message.role === "assistant" && !message.live,
  });
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be denied — non-fatal, button just won't confirm.
    }
  };

  const settled = !message.streaming && shown.length === message.text.length;

  return (
    <div className={`asst-msg asst-msg-${message.role}`}>
      <div className="asst-msg-bubble">
        {message.role === "assistant" ? <MiniMarkdown text={shown} /> : <p>{message.text}</p>}
        {message.role === "assistant" && message.action && settled && (
          <a
            className="asst-action-btn"
            href={message.action.href}
            target={message.action.type === "external" ? "_blank" : undefined}
            rel={message.action.type === "external" ? "noopener noreferrer" : undefined}
            download={message.action.type === "download" ? true : undefined}
          >
            {message.action.label} →
          </a>
        )}
      </div>
      {message.role === "assistant" && settled && (
        <div className="asst-msg-actions">
          <button type="button" className="asst-copy-btn" onClick={copy} aria-label="Copy response">
            {copied ? "copied" : "copy"}
          </button>
          {isLatest && canRegenerate && (
            <button type="button" className="asst-copy-btn" onClick={onRegenerate} aria-label="Regenerate response">
              regenerate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AssistantPanel({ onClose, focusMode, onToggleFocus }) {
  const [mode, setMode] = useState("general");
  const [messages, setMessages, clearMessages] = usePersistedMessages();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [shared, setShared] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const context = useAssistantContext();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Escape exits full-screen mode first (if active), then closes the panel
  // on a second press — matches the behavior people expect from Cmd/Ctrl+K
  // style panels elsewhere on the site.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (focusMode) {
        onToggleFocus();
      } else {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode, onToggleFocus, onClose]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;
  const abortRef = useRef(null);
  const [isBusy, setIsBusy] = useState(false); // true from send until the answer (local or streamed) fully settles

  useEffect(() => () => abortRef.current?.abort(), []);

  function answerLocally(query, assistantId) {
    // Simulated latency before the (local, synchronous) fallback engine
    // answers — purely so the UI reads as "thinking" rather than
    // instant/robotic, matching the pacing of a real request.
    setTimeout(() => {
      const result = answerQuery(query, context);
      setThinking(false);
      setIsBusy(false);
      setMessages((m) => [
        ...m,
        { id: assistantId, role: "assistant", text: result.text, action: result.action, followUps: result.followUps, ts: Date.now() },
      ]);
    }, 450 + Math.random() * 350);
  }

  // Core request path, shared by send() (new question) and regenerate()
  // (re-ask the same question, replacing the previous answer). `historyMsgs`
  // is the full message list to send as context; `query` is only used for
  // the local-engine fallback, which doesn't take conversation history.
  async function runAssistant(query, historyMsgs) {
    const assistantId = crypto.randomUUID();
    setThinking(true);
    setIsBusy(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let started = false;
    try {
      await streamAssistant(
        { messages: historyMsgs.map(({ role, text: t }) => ({ role, text: t })), mode, context },
        {
          signal: controller.signal,
          onDelta: (_chunk, full) => {
            if (!started) {
              started = true;
              setThinking(false);
              setMessages((m) => [
                ...m,
                { id: assistantId, role: "assistant", text: full, live: true, streaming: true, ts: Date.now() },
              ]);
            } else {
              setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, text: full } : msg)));
            }
          },
        }
      );
      if (started) {
        setIsBusy(false);
        setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, streaming: false } : msg)));
      } else {
        // Stream "succeeded" but produced nothing — treat as a fallback case.
        throw new Error("empty stream");
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setIsBusy(false);
        setThinking(false);
        return; // stopped by the user, or superseded by a newer request
      }
      setThinking(false);
      if (started) {
        // Partial answer already showing — leave it rather than replacing
        // it with a duplicate local answer.
        setIsBusy(false);
        setMessages((m) => m.map((msg) => (msg.id === assistantId ? { ...msg, streaming: false } : msg)));
      } else {
        answerLocally(query, assistantId);
      }
    }
  }

  function send(text) {
    const query = (text ?? input).trim();
    if (!query) return;
    const userMsg = { id: crypto.randomUUID(), role: "user", text: query, ts: Date.now() };
    const next = [...messages, userMsg];
    setInput("");
    setMessages(next);
    runAssistant(query, next);
  }

  function stop() {
    abortRef.current?.abort();
  }

  function regenerate() {
    if (isBusy) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const cutIdx = messages.length - 1 - lastUserIdx; // index of the last user message
    const historyUpToUser = messages.slice(0, cutIdx + 1);
    const query = messages[cutIdx].text;
    setMessages(historyUpToUser); // drop the old assistant answer being replaced
    runAssistant(query, historyUpToUser);
  }

  async function shareConversation() {
    const text = messages.map((m) => `${m.role === "user" ? "Q" : "A"}: ${m.text}`).join("\n\n");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Conversation with Aman's portfolio assistant", text });
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // clipboard denied — nothing further to do
    }
  }

  const prompts = suggestedPrompts(mode, context);

  return (
    <div className={`asst-panel${focusMode ? " asst-panel-focus" : ""}`} role="dialog" aria-modal={focusMode ? "true" : undefined} aria-label="Portfolio AI assistant">
      <div className="asst-header">
        <div className="asst-header-top">
          <span className="asst-header-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L14.2 9.2L21 12L14.2 14.8L12 22L9.8 14.8L3 12L9.8 9.2L12 2Z" fill="currentColor" />
            </svg>
            Ask about Aman
          </span>
          <div className="asst-header-actions">
            <span className="asst-kbd-hint" aria-hidden="true">esc</span>
            <button type="button" onClick={onToggleFocus} aria-label={focusMode ? "Exit full screen" : "Full screen"}>
              {focusMode ? "⤡" : "⤢"}
            </button>
            <button type="button" onClick={shareConversation} aria-label="Share conversation">
              {shared ? "✓" : "share"}
            </button>
            <button type="button" onClick={clearMessages} aria-label="Clear conversation">clear</button>
            <button type="button" onClick={onClose} aria-label="Close assistant">×</button>
          </div>
        </div>
        <div className="asst-modes" role="tablist" aria-label="Assistant mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={`asst-mode-btn${mode === m.id ? " asst-mode-active" : ""}`}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        {context.projectSlug && (
          <div className="asst-context-note">Viewing this project — ask "explain this architecture" and I'll know what you mean.</div>
        )}
        {context.serviceId && (
          <div className="asst-context-note">Viewing this service — ask "is this a fit for me" and I'll know what you mean.</div>
        )}
        {context.page === "services" && (
          <div className="asst-context-note">Browsing services — ask "recommend a service" and I'll factor in what you're looking at.</div>
        )}
      </div>

      <div className="asst-messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="asst-empty">
            <p>Answers come only from Aman's real resume, projects, and skills — ask anything below.</p>
            {(mode === "recruiter" || mode === "client") && (
              <div className="asst-quick-grid">
                {QUICK_ACTIONS[mode].map((action) => (
                  <button key={action} type="button" className="asst-quick-btn" onClick={() => send(action)}>
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isLatest={m.id === lastAssistantId}
            onRegenerate={regenerate}
            canRegenerate={!isBusy}
          />
        ))}
        {thinking && (
          <div className="asst-msg asst-msg-assistant">
            <div className="asst-msg-bubble asst-thinking">
              <span className="asst-dot" /><span className="asst-dot" /><span className="asst-dot" />
            </div>
          </div>
        )}
      </div>

      {isBusy && (
        <div className="asst-stop-row">
          <button type="button" className="asst-stop-btn" onClick={stop}>■ stop generating</button>
        </div>
      )}

      <div className="asst-prompts">
        {(messages[messages.length - 1]?.followUps?.length ? messages[messages.length - 1].followUps : prompts).slice(0, 4).map((p) => (
          <button key={p} type="button" className="asst-prompt-chip" onClick={() => send(p)} disabled={isBusy}>{p}</button>
        ))}
      </div>

      <form
        className="asst-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (isBusy) return;
          send();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about projects, skills, or how to hire…"
          aria-label="Ask the assistant"
          disabled={isBusy}
        />
        {isBusy ? (
          <button type="button" onClick={stop} aria-label="Stop generating">■</button>
        ) : (
          <button type="submit" aria-label="Send" disabled={!input.trim()}>→</button>
        )}
      </form>
    </div>
  );
}
