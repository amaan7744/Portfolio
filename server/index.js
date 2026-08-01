// Minimal Express backend for the portfolio's contact form.
//
// In production this would forward messages to an email service; here it
// validates the payload and appends it to a local JSON log so the form is
// fully functional out of the box. The frontend falls back to opening the
// visitor's mail client if this server isn't running (e.g. on static hosting).

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isConfigured, checkRateLimit, streamAssistantReply } from "./assistant.js";
import { getActiveProvider } from "./providers/index.js";

// Zero-dependency .env loader (Node has no built-in .env support until
// --env-file, which we don't want to require callers to remember). Only
// fills in keys that aren't already set in the real environment, so a
// platform-provided ANTHROPIC_API_KEY (Vercel/Render/etc.) always wins.
function loadDotEnv() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "messages.json");
const PORT = process.env.PORT || 5174;

const app = express();
app.use(cors());
app.use(express.json());

function readMessages() {
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  } catch {
    return [];
  }
}

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "invalid email address" });
  }

  const entry = { name, email, message, receivedAt: new Date().toISOString() };
  const messages = readMessages();
  messages.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(messages, null, 2));

  console.log(`[contact] new message from ${name} <${email}>`);
  res.status(200).json({ ok: true });
});

app.get("/api/health", (_req, res) =>
  res.json({
    status: "ok",
    assistant: isConfigured() ? "llm" : "unavailable",
    provider: getActiveProvider()?.id || null,
  })
);

// Streaming LLM assistant. Returns plain-text chunks (not raw SSE) over a
// chunked response — the frontend just reads the response body stream and
// appends text, so it doesn't need to parse Anthropic's event format too.
app.post("/api/assistant", async (req, res) => {
  if (!isConfigured()) {
    return res.status(503).json({ error: "assistant not configured" });
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: "rate limit exceeded", retryAfterMs });
  }

  const { messages, mode, context } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Headers are only committed once the first token actually arrives, so
  // an upstream failure (bad key, Anthropic outage, etc.) can still come
  // back as a normal JSON error response and let the client fall back to
  // the local engine — a 200 with an empty body would look like success.
  let headersSent = false;
  await streamAssistantReply(
    { history: messages, mode, context },
    {
      onDelta: (text) => {
        if (!headersSent) {
          headersSent = true;
          res.writeHead(200, {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-cache",
            "x-content-type-options": "nosniff",
          });
        }
        res.write(text);
      },
      onDone: () => res.end(),
      onError: (err) => {
        console.error("[assistant] stream error:", err.message);
        if (headersSent) {
          res.end();
        } else {
          res.status(502).json({ error: "assistant upstream error" });
        }
      },
    }
  );
});

app.listen(PORT, () => {
  console.log(`Contact API listening on http://localhost:${PORT}`);
});
