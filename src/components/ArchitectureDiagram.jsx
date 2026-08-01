import { useEffect, useRef, useState } from "react";
import { projects } from "../data/content";
import "../components/PipelineDiagram.css";
import "./ArchitectureDiagram.css";
import DiagramNode from "./DiagramNode";
import DiagramCanvas from "./DiagramCanvas";
import NodeDetailPanel from "./NodeDetailPanel";

// Three real system diagrams — one per project — distinct from the
// home-page pipeline diagram and from each other, so a recruiter
// scanning case studies sees the actual shape of each system rather
// than a repeated illustration. Each node now carries full engineering
// documentation (technology, purpose, decision rationale, trade-offs,
// scaling strategy, failure points, code location) surfaced through a
// click-to-open side panel, with zoom/pan, focus mode, connection
// highlighting, and a category legend/filter layered on top — the
// whole thing behaves like a small internal architecture explorer
// rather than a static illustration.

const CATEGORY_LABELS = {
  ingestion: "Ingestion",
  ml: "ML model",
  compute: "Processing",
  automation: "Automation",
  api: "API",
  storage: "Storage",
  client: "Client",
};

function DiagramLegend({ categories, active, onToggle }) {
  return (
    <div className="diagram-legend" role="group" aria-label="Filter diagram by technology category">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          className={`legend-chip${active === cat ? " legend-chip-active" : ""}`}
          data-category={cat}
          aria-pressed={active === cat}
          onClick={() => onToggle(cat)}
        >
          <span className="legend-dot" />
          {CATEGORY_LABELS[cat] || cat}
        </button>
      ))}
      {active && (
        <button type="button" className="legend-clear" onClick={() => onToggle(active)}>
          clear filter
        </button>
      )}
    </div>
  );
}

// Small helper so each diagram can express "dim this connector unless
// it touches the selected node" without hand-rolling the className
// logic at every path element.
function edgeCls(ids, selectedId) {
  return `flow-line${selectedId && !ids.includes(selectedId) ? " flow-line-dim" : ""}`;
}

function MediaPipelineDiagram({ selectedId, onSelect, activeCategory, nodesById }) {
  const n = (id) => nodesById[id];
  return (
    <svg
      className="pipeline-svg arch-svg"
      viewBox="0 0 980 260"
      role="img"
      aria-label="Architecture diagram: source retrieval feeds highlight detection, which feeds clip extraction, then transcription and voice synthesis run in parallel, feeding vertical video assembly, with state committed back to the repository by a daily GitHub Actions cron job."
    >
      <path className={edgeCls(["ytdlp", "highlight"], selectedId)} d="M90,130 H190" />
      <path className={edgeCls(["highlight", "clip"], selectedId)} d="M290,130 H390" />
      <path className={edgeCls(["clip", "whisper"], selectedId)} d="M490,130 H540 V70 H590" />
      <path className={edgeCls(["clip", "xtts"], selectedId)} d="M490,130 H540 V190 H590" />
      <path className={edgeCls(["whisper", "assembly"], selectedId)} d="M690,70 H740 V130 H790" />
      <path className={edgeCls(["xtts", "assembly"], selectedId)} d="M690,190 H740 V130 H790" />
      <path className={edgeCls(["assembly", "actions"], selectedId)} d="M890,130 V210 H490 V170" />

      <circle className="flow-dot" r="3">
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M90,130 H190 M290,130 H390 M490,130 H540 V70 H590" />
      </circle>
      <circle className="flow-dot" r="3">
        <animateMotion dur="2.8s" repeatCount="indefinite" begin="0.6s" path="M490,130 H540 V190 H590" />
      </circle>
      <circle className="flow-dot" r="3">
        <animateMotion dur="2.2s" repeatCount="indefinite" begin="1.3s" path="M690,70 H740 V130 H790 M690,190 H740 V130 H790" />
      </circle>
      <circle className="flow-dot arch-dot-commit" r="3">
        <animateMotion dur="3.4s" repeatCount="indefinite" begin="1.9s" path="M890,130 V210 H490 V170" />
      </circle>

      <DiagramNode id="ytdlp" label="yt-dlp" category="ingestion" detail={n("ytdlp")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="10" y="105" width="80" height="50" rx="8" />
        <text className="node-label" x="50" y="127" textAnchor="middle">yt-dlp</text>
        <text className="node-sub" x="50" y="141" textAnchor="middle">retrieval</text>
      </DiagramNode>

      <DiagramNode id="highlight" label="Highlight detection" category="compute" detail={n("highlight")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="190" y="105" width="100" height="50" rx="8" />
        <text className="node-label" x="240" y="127" textAnchor="middle">Highlight</text>
        <text className="node-sub" x="240" y="141" textAnchor="middle">detection</text>
      </DiagramNode>

      <DiagramNode id="clip" label="Clip extraction" category="compute" detail={n("clip")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="390" y="105" width="100" height="50" rx="8" />
        <text className="node-label" x="440" y="127" textAnchor="middle">Clip</text>
        <text className="node-sub" x="440" y="141" textAnchor="middle">extraction</text>
      </DiagramNode>

      <DiagramNode id="whisper" label="Whisper" category="ml" detail={n("whisper")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="590" y="45" width="100" height="50" rx="8" />
        <text className="node-label" x="640" y="67" textAnchor="middle">Whisper</text>
        <text className="node-sub" x="640" y="81" textAnchor="middle">transcription</text>
      </DiagramNode>

      <DiagramNode id="xtts" label="XTTS-v2" category="ml" detail={n("xtts")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="590" y="165" width="100" height="50" rx="8" />
        <text className="node-label" x="640" y="187" textAnchor="middle">XTTS-v2</text>
        <text className="node-sub" x="640" y="201" textAnchor="middle">voice synth</text>
      </DiagramNode>

      <DiagramNode id="assembly" label="FFmpeg assembly" category="compute" detail={n("assembly")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="790" y="105" width="100" height="50" rx="8" />
        <text className="node-label" x="840" y="127" textAnchor="middle">FFmpeg</text>
        <text className="node-sub" x="840" y="141" textAnchor="middle">assembly</text>
      </DiagramNode>

      <DiagramNode id="actions" label="GitHub Actions" category="automation" detail={n("actions")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box cron-badge" x="390" y="185" width="200" height="44" rx="8" />
        <text className="node-label" x="490" y="205" textAnchor="middle" fill="var(--live)">GitHub Actions</text>
        <text className="cron-text" x="490" y="219" textAnchor="middle">daily cron → commit state</text>
      </DiagramNode>
    </svg>
  );
}

function VoiceApiDiagram({ selectedId, onSelect, activeCategory, nodesById }) {
  const n = (id) => nodesById[id];
  return (
    <svg
      className="pipeline-svg arch-svg"
      viewBox="0 0 780 180"
      role="img"
      aria-label="Architecture diagram: a client sends a POST request with text to a Flask REST endpoint, which runs it through a warm-loaded XTTS-v2 model and returns synthesized audio."
    >
      <path className={edgeCls(["client", "flask"], selectedId)} d="M90,90 H220" />
      <path className={edgeCls(["flask", "xttsWarm"], selectedId)} d="M370,90 H500" />
      <path className={`${edgeCls(["xttsWarm", "flask"], selectedId)} arch-return`} d="M500,120 H370" />
      <path className={`${edgeCls(["flask", "client"], selectedId)} arch-return`} d="M220,120 H90" />
      <path className={edgeCls(["xttsWarm", "audio"], selectedId)} d="M600,90 H680" />

      <circle className="flow-dot" r="3">
        <animateMotion dur="2s" repeatCount="indefinite" path="M90,90 H220 M370,90 H500" />
      </circle>
      <circle className="flow-dot" r="3">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.2s" path="M600,90 H680" />
      </circle>
      <circle className="flow-dot arch-dot-commit" r="3">
        <animateMotion dur="2s" repeatCount="indefinite" begin="1.9s" path="M500,120 H370 M220,120 H90" />
      </circle>

      <DiagramNode id="client" label="Client" category="client" detail={n("client")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="10" y="65" width="80" height="50" rx="8" />
        <text className="node-label" x="50" y="87" textAnchor="middle">Client</text>
        <text className="node-sub" x="50" y="101" textAnchor="middle">caller</text>
      </DiagramNode>

      <DiagramNode id="flask" label="Flask endpoint" category="api" detail={n("flask")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="220" y="65" width="150" height="50" rx="8" />
        <text className="node-label" x="295" y="83" textAnchor="middle">Flask</text>
        <text className="node-sub" x="295" y="97" textAnchor="middle">POST /synthesize</text>
        <text className="node-sub" x="295" y="108" textAnchor="middle" opacity="0.7">text → audio</text>
      </DiagramNode>

      <DiagramNode id="xttsWarm" label="XTTS-v2 (warm model)" category="ml" detail={n("xttsWarm")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="500" y="65" width="100" height="50" rx="8" />
        <text className="node-label" x="550" y="87" textAnchor="middle">XTTS-v2</text>
        <text className="node-sub" x="550" y="101" textAnchor="middle">warm model</text>
      </DiagramNode>

      <DiagramNode id="audio" label="Audio response" category="api" detail={n("audio")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="680" y="65" width="90" height="50" rx="8" />
        <text className="node-label" x="725" y="87" textAnchor="middle">Audio</text>
        <text className="node-sub" x="725" y="101" textAnchor="middle">response</text>
      </DiagramNode>
    </svg>
  );
}

function MernDiagram({ selectedId, onSelect, activeCategory, nodesById }) {
  const n = (id) => nodesById[id];
  return (
    <svg
      className="pipeline-svg arch-svg"
      viewBox="0 0 900 220"
      role="img"
      aria-label="Architecture diagram: a React frontend calls an Express.js REST API over three resources — accounts, listings, and bookings — all backed by a shared MongoDB database."
    >
      <path className={edgeCls(["frontend", "expressApi"], selectedId)} d="M90,110 H220" />
      <path className={edgeCls(["expressApi", "accounts"], selectedId)} d="M370,60 H460" />
      <path className={edgeCls(["expressApi", "listings"], selectedId)} d="M370,110 H460" />
      <path className={edgeCls(["expressApi", "bookings"], selectedId)} d="M370,160 H460" />
      <path className={edgeCls(["accounts", "mongo"], selectedId)} d="M610,60 H660 V110 H710" />
      <path className={edgeCls(["listings", "mongo"], selectedId)} d="M610,110 H710" />
      <path className={edgeCls(["bookings", "mongo"], selectedId)} d="M610,160 H660 V110 H710" />

      <circle className="flow-dot" r="3">
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M90,110 H220 M370,60 H460" />
      </circle>
      <circle className="flow-dot" r="3">
        <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.7s" path="M370,110 H460" />
      </circle>
      <circle className="flow-dot" r="3">
        <animateMotion dur="2.6s" repeatCount="indefinite" begin="1.3s" path="M370,160 H460" />
      </circle>
      <circle className="flow-dot arch-dot-commit" r="3">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="2s" path="M610,110 H710" />
      </circle>

      <DiagramNode id="frontend" label="React frontend" category="client" detail={n("frontend")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="10" y="85" width="80" height="50" rx="8" />
        <text className="node-label" x="50" y="107" textAnchor="middle">React</text>
        <text className="node-sub" x="50" y="121" textAnchor="middle">Bootstrap UI</text>
      </DiagramNode>

      <DiagramNode id="expressApi" label="Express.js API" category="api" detail={n("expressApi")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="220" y="85" width="150" height="50" rx="8" />
        <text className="node-label" x="295" y="107" textAnchor="middle">Express.js API</text>
        <text className="node-sub" x="295" y="121" textAnchor="middle">REST layer</text>
      </DiagramNode>

      <DiagramNode id="accounts" label="/accounts" category="api" detail={n("accounts")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="460" y="35" width="150" height="50" rx="8" />
        <text className="node-label" x="535" y="57" textAnchor="middle">/accounts</text>
        <text className="node-sub" x="535" y="71" textAnchor="middle">auth</text>
      </DiagramNode>

      <DiagramNode id="listings" label="/listings" category="api" detail={n("listings")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="460" y="85" width="150" height="50" rx="8" />
        <text className="node-label" x="535" y="107" textAnchor="middle">/listings</text>
        <text className="node-sub" x="535" y="121" textAnchor="middle">movies</text>
      </DiagramNode>

      <DiagramNode id="bookings" label="/bookings" category="api" detail={n("bookings")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box" x="460" y="135" width="150" height="50" rx="8" />
        <text className="node-label" x="535" y="157" textAnchor="middle">/bookings</text>
        <text className="node-sub" x="535" y="171" textAnchor="middle">history</text>
      </DiagramNode>

      <DiagramNode id="mongo" label="MongoDB" category="storage" detail={n("mongo")} selectedId={selectedId} activeCategory={activeCategory} onSelect={onSelect}>
        <rect className="node-box cron-badge" x="710" y="85" width="180" height="50" rx="8" />
        <text className="node-label" x="800" y="107" textAnchor="middle" fill="var(--live)">MongoDB</text>
        <text className="cron-text" x="800" y="121" textAnchor="middle">shared document store</text>
      </DiagramNode>
    </svg>
  );
}

// Full engineering documentation per node, keyed the same way each
// diagram's `id` props are keyed. This is the content that appears in
// the side panel — technology choice, why it exists, why that
// technology over the alternatives, dependencies, trade-offs, scaling
// strategy, failure points, and where the code lives, so the diagram
// reads like an internal architecture wiki rather than a labeled box.
export const NODE_DETAILS = {
  "automated-media-content-pipeline": {
    ytdlp: {
      technology: "yt-dlp (Python CLI, run as a subprocess)",
      purpose: "Retrieves the source video from YouTube — the entry point of the daily automated run.",
      decision: "Chosen over the YouTube Data API because it needs no API key or quota, and already handles format selection and throttling.",
      alternatives: ["YouTube Data API v3 — quota limits, no direct stream download", "youtube-dl — unmaintained; yt-dlp is the active fork"],
      responsibilities: ["Resolve the source video", "Download the highest-quality available stream", "Hand the raw file to highlight detection"],
      input: "A source video URL or channel identifier",
      output: "A raw downloaded video file on the runner's disk",
      dependencies: ["Network access to YouTube", "Disk space on the GitHub Actions runner"],
      tradeoffs: "No API quota to manage, but exposed to upstream site changes yt-dlp has to keep pace with.",
      scaling: "One video per run today; scaling would mean parallel runner jobs per source, not scaling this stage in isolation.",
      failurePoints: "Breaks if YouTube changes page structure faster than yt-dlp releases, or the source video is removed/region-locked.",
      future: "Add a fallback source list so one dead video doesn't stall the day's run.",
      performance: "Download time is dominated by network throughput and source video length — not CPU-bound on the runner.",
      security: "Runs arbitrary yt-dlp extraction logic against an external site; no sandboxing beyond the ephemeral GitHub Actions runner itself.",
      code: "scripts/ingest/fetch_source.py",
    },
    highlight: {
      technology: "Custom audio-energy heuristic (Python)",
      purpose: "Picks the segment of the source video worth turning into a clip, before any heavier processing runs.",
      decision: "A lightweight signal-based heuristic runs first specifically to avoid paying full transcription cost on content that's never used.",
      alternatives: ["Full transcript + LLM summarization — more accurate, far higher compute cost per run", "Manual curation — defeats the purpose of automation"],
      responsibilities: ["Score candidate windows in the source video", "Select the single best window for extraction"],
      input: "Raw downloaded video",
      output: "A start/end timestamp window",
      dependencies: ["yt-dlp output"],
      tradeoffs: "Cheaper and faster than an LLM pass, but can miss highlights that aren't audio-driven.",
      scaling: "Runs once per video; multiple candidate clips would need re-scoring logic.",
      failurePoints: "Silent or low-dynamic-range audio produces a weak signal and a poor highlight choice.",
      future: "Add a transcript-aware second pass for low-confidence audio scores.",
      performance: "Lightweight — a single pass over the audio signal, negligible next to the ML stages downstream.",
      security: "Processes only local files already fetched by yt-dlp; no external input at this stage.",
      code: "scripts/detect/highlight.py",
    },
    clip: {
      technology: "FFmpeg (subprocess, stream copy where possible)",
      purpose: "Cuts the detected highlight window out of the source video before transcription and voice synthesis run on it.",
      decision: "FFmpeg over a Python video library — it's the standard for fast, codec-correct cuts and is already required for final assembly.",
      alternatives: ["moviepy — slower, adds a heavy dependency for something FFmpeg does natively"],
      responsibilities: ["Trim to the highlight window", "Normalize format for downstream ML steps"],
      input: "Raw video + timestamp window",
      output: "A short clip file",
      dependencies: ["Highlight detection output", "FFmpeg binary on the runner image"],
      tradeoffs: "Re-encoding costs runner time but guarantees a clean, consistent input for Whisper and XTTS.",
      scaling: "Single clip per run; not a bottleneck at current volume.",
      failurePoints: "Timestamp drift from the detection stage can clip mid-sentence.",
      future: "Snap cut points to the nearest silence gap to avoid mid-word cuts.",
      performance: "Stream-copy where possible keeps this stage fast; re-encoding, when required, is the more expensive path.",
      security: "Operates on a local file only; no network exposure at this stage.",
      code: "scripts/process/extract_clip.py",
    },
    whisper: {
      technology: "OpenAI Whisper (open-source, run locally on the runner)",
      purpose: "Transcribes the clip for subtitles — runs in parallel with voice synthesis on the same GitHub Actions runner.",
      decision: "Run locally instead of a hosted API to avoid per-call cost and rate limits on a fully unattended daily job.",
      alternatives: ["Hosted Whisper API — simpler, but recurring cost and network dependency", "AssemblyAI / other hosted STT"],
      responsibilities: ["Transcribe clip audio to timestamped text"],
      input: "Extracted clip",
      output: "Timestamped transcript",
      dependencies: ["Clip extraction output", "CPU/GPU budget on the shared runner"],
      tradeoffs: "No API cost, but transcription time is bounded by whatever compute the runner gives it — the tightest constraint in the pipeline.",
      scaling: "Runs once per clip; a longer clip or smaller runner directly increases wall-clock time.",
      failurePoints: "GitHub Actions job timeout on a slow runner with a long clip; degraded accuracy on noisy audio.",
      future: "Cache model weights between runs; consider a smaller Whisper variant if timeouts recur.",
      performance: "The tightest constraint in the pipeline — transcription time is bounded by the runner's CPU, not just clip length.",
      security: "Runs entirely offline on the runner; no data leaves the job for this stage.",
      code: "scripts/transcribe/whisper_runner.py",
    },
    xtts: {
      technology: "Coqui XTTS-v2 (open-source voice cloning/synthesis)",
      purpose: "Re-synthesizes the voice track — a second ML model composed into the same automated workflow, not called once and thrown away.",
      decision: "Open weights and reference-voice cloning without a hosted API dependency, matching the constraint of running unattended on a schedule.",
      alternatives: ["ElevenLabs / hosted TTS — higher quality, but recurring external cost and a hard dependency on every scheduled run"],
      responsibilities: ["Synthesize a new voice track from the transcript"],
      input: "Transcript + reference voice sample",
      output: "Synthesized audio track",
      dependencies: ["Whisper transcript", "Reference voice asset stored in the repo"],
      tradeoffs: "Avoids per-run API cost but competes with Whisper for the same runner CPU budget.",
      scaling: "One voice track per clip; a second voice/language doubles this stage's runtime.",
      failurePoints: "Runner timeout under load; synthesized audio drifting out of sync if clip length changes upstream.",
      future: "Move ML inference to a persistent worker so scheduled runs trigger only a lightweight job.",
      performance: "Competes with Whisper for the same runner CPU budget when both run in the same window — the main resource-contention point in the pipeline.",
      security: "The reference voice asset is stored in the repo rather than fetched at runtime, so no external credential or endpoint is exposed here.",
      code: "scripts/synthesize/xtts_runner.py",
    },
    assembly: {
      technology: "FFmpeg",
      purpose: "Reassembles the transcribed, voice-synthesized audio with video into the final vertical-format output.",
      decision: "Same tool as extraction, reused for the final mux/format step rather than introducing a second video library.",
      alternatives: ["A separate rendering library for vertical reformatting — unnecessary, FFmpeg's filters already cover crop/scale"],
      responsibilities: ["Mux new audio with source video", "Crop/scale to vertical format"],
      input: "Clip video + synthesized audio",
      output: "Final vertical video file",
      dependencies: ["Clip extraction", "XTTS-v2 output"],
      tradeoffs: "Doing format conversion last keeps every upstream ML stage working with original-resolution source, at the cost of one more full encode.",
      scaling: "One file per run; encoding time scales with clip length, not with downstream viewership.",
      failurePoints: "Audio/video desync if either input's duration doesn't match what assembly expects.",
      future: "Add automated QA (duration/aspect ratio check) before the commit step.",
      performance: "The full re-encode for final mux is the most CPU-intensive single step after the ML stages themselves.",
      security: "Local file operation only; no network calls at this stage.",
      code: "scripts/assemble/render_final.py",
    },
    actions: {
      technology: "GitHub Actions (scheduled cron workflow)",
      purpose: "A daily cron trigger runs the whole pipeline headlessly on a clean runner and commits the updated rotation state back to the repo itself.",
      decision: "Removes the cost and operational burden of keeping a machine running 24/7 for one daily job.",
      alternatives: ["A persistent cron server/VM — always-on cost for a once-a-day job", "AWS Lambda + EventBridge — would need another answer to the model cold-start problem"],
      responsibilities: ["Trigger the pipeline on schedule", "Provide a clean, disposable compute environment", "Commit updated state back to the repository"],
      input: "Cron schedule trigger",
      output: "Updated rotation state committed to git",
      dependencies: ["All upstream stages completing within the job's time limit"],
      tradeoffs: "No server to maintain or idle cost, but every run pays a cold-start cost (fresh checkout, fresh install, cold model load).",
      scaling: "One scheduled job per day today; more frequent runs would need to fit inside Actions' concurrency and minute limits.",
      failurePoints: "Job timeout under the free-tier minute limit if any stage runs long; git conflicts if two runs somehow overlap.",
      future: "Move state to a small external store to remove the commit-race risk if run frequency increases.",
      performance: "Cold-start cost — fresh checkout, dependency install, cold model load — is paid on every run and is the main latency driver outside the ML stages themselves.",
      security: "Commits state back to the repo using the workflow's scoped GITHUB_TOKEN; no long-lived credentials are stored on the runner.",
      code: ".github/workflows/daily-pipeline.yml",
    },
  },
  "voice-synthesis-rest-api": {
    client: {
      technology: "Any HTTP caller",
      purpose: "Any caller can hit this endpoint — the whole point of extracting it from the media pipeline was to make it reusable, not tied to one caller.",
      decision: "No client SDK was built deliberately — a plain REST contract keeps the service usable from the media pipeline, a script, or a future frontend without extra coupling.",
      alternatives: ["A bundled client library — adds maintenance surface for a service with one real internal consumer today"],
      responsibilities: ["Send text to be synthesized", "Handle the returned audio"],
      input: "N/A — this is the caller",
      output: "A POST request with a text payload",
      dependencies: ["Network access to the Flask endpoint"],
      tradeoffs: "Plain REST over a typed client trades some ergonomics for zero coupling between caller and service.",
      scaling: "Any number of callers can be added without changing the service.",
      failurePoints: "A caller with no timeout/retry logic will hang if the service is cold or under load.",
      future: "Publish a minimal OpenAPI spec so new callers don't have to read the source to integrate.",
      performance: "Determined entirely by the caller's own request pattern — nothing the service controls.",
      security: "No authentication on the endpoint today — anyone who can reach it can request synthesis.",
      code: "N/A — external caller",
    },
    flask: {
      technology: "Flask (Python)",
      purpose: "A single POST /synthesize endpoint accepts text and returns audio. Model loading is isolated from caller-specific logic, keeping the service generic.",
      decision: "A small synchronous single-endpoint service doesn't need async framework overhead — XTTS-v2 inference itself is the bottleneck, not I/O concurrency.",
      alternatives: ["FastAPI — async support this synchronous, single-model service doesn't currently need", "gRPC — more setup than one JSON-in/audio-out endpoint justifies"],
      responsibilities: ["Validate incoming text", "Call the warm model", "Stream back the resulting audio"],
      input: "JSON body with text",
      output: "Audio file response",
      dependencies: ["Warm XTTS-v2 model process"],
      tradeoffs: "Simple to reason about, but one slow request blocks the worker handling it — fine at current traffic, a real limit at higher concurrency.",
      scaling: "Vertical only right now; more warm-model replicas behind a load balancer would be the next step.",
      failurePoints: "Long or malformed input text can stall a request past a caller's timeout.",
      future: "Add request queuing and multiple warm-model workers behind a load balancer.",
      performance: "Single-worker synchronous handling means one slow request blocks the next — the main throughput ceiling at current traffic.",
      security: "No auth, rate limiting, or request-size cap yet — an oversized text payload could tie up the worker.",
      code: "app.py",
    },
    xttsWarm: {
      technology: "Coqui XTTS-v2, loaded once at process start",
      purpose: "The model is loaded once and kept warm rather than reloaded per request — the deliberate trade-off that keeps request latency reasonable in a synchronous Flask service.",
      decision: "Model load time is the single largest cost in the request lifecycle, so keeping it resident in memory was chosen over loading per request.",
      alternatives: ["Load the model per request — simple, but multi-second cold load on every call makes it unusable as an API", "Queue requests through the model — better throughput, more complexity than current traffic needs"],
      responsibilities: ["Hold the model in memory across requests", "Run inference on each incoming text"],
      input: "Validated text from the Flask layer",
      output: "Synthesized speech waveform",
      dependencies: ["Enough process memory to keep the model resident"],
      tradeoffs: "Trades memory footprint (held for the process lifetime) for consistent low-latency responses.",
      scaling: "One warm model per process; scaling out means running more processes, each paying its own memory cost.",
      failurePoints: "Process restart forces a cold reload; memory pressure from other processes can evict or slow it.",
      future: "Move the model behind a dedicated inference process so an API restart doesn't force a reload.",
      performance: "Removing model load from the request path is the single biggest latency win in this service — the whole reason it's warm-loaded.",
      security: "Model weights and reference assets are local to the process; no external model-serving endpoint to secure.",
      code: "model/xtts_loader.py",
    },
    audio: {
      technology: "Flask response with audio content-type",
      purpose: "Synthesized speech is returned directly in the response — no queue, no polling, since the model is already warm.",
      decision: "Synchronous return was chosen over async job + polling because the warm model keeps single-request latency acceptable without that added complexity.",
      alternatives: ["Job queue + polling endpoint — needed only if per-request latency became too high for callers to hold a connection open"],
      responsibilities: ["Stream the generated audio back to the caller"],
      input: "Synthesized waveform",
      output: "Audio file bytes in the HTTP response",
      dependencies: ["XTTS-v2 warm model output"],
      tradeoffs: "Simple now, at the cost of callers needing to hold a connection open for the full synthesis time.",
      scaling: "Fine at current latency; would need to become async if synthesis time grows or traffic increases.",
      failurePoints: "Caller-side timeouts if synthesis takes longer than expected.",
      future: "Add streaming (chunked) audio response so playback can start before synthesis fully completes.",
      performance: "Synchronous return keeps the response path simple but ties up the connection for the full synthesis duration.",
      security: "Returned audio isn't scanned or size-capped before being sent back to the caller.",
      code: "app.py",
    },
  },
  "movie-booking-platform": {
    frontend: {
      technology: "React + Bootstrap",
      purpose: "React frontend with Bootstrap handling responsive layout — consumes the same REST endpoints the API exposes, nothing bespoke.",
      decision: "Bootstrap keeps the frontend layer lightweight and fast to ship for a project focused on proving out the backend/API design.",
      alternatives: ["A custom component library — more polish, more time than this project's focus justifies"],
      responsibilities: ["Render listings and booking flows", "Call the REST API for all data"],
      input: "User interactions",
      output: "REST requests to the Express API",
      dependencies: ["Express.js API"],
      tradeoffs: "Ships faster but looks less distinctive than a custom UI would.",
      scaling: "Static hosting scales independently of the API/backend.",
      failurePoints: "No client-side caching layer, so every view re-fetches from the API.",
      future: "Add a client cache (SWR-style fetching) to cut redundant requests.",
      performance: "No client-side caching means every view re-fetches from the API, even for data that rarely changes, like listings.",
      security: "Auth state is handled client-side; token storage/handling would need review before this went to production traffic.",
      code: "client/src/",
    },
    expressApi: {
      technology: "Express.js on Node.js",
      purpose: "Express.js/Node.js REST layer — the API surface is split into separate resources rather than one monolithic endpoint, matching standard REST conventions.",
      decision: "Express gives a straightforward REST layer without a heavier framework's conventions for a project of this scope.",
      alternatives: ["NestJS — more structure than a project this size needs", "GraphQL — adds a query layer this simple resource model doesn't require"],
      responsibilities: ["Route requests to the correct resource handler", "Enforce request validation before hitting MongoDB"],
      input: "HTTP requests from the frontend",
      output: "Routed calls to /accounts, /listings, /bookings",
      dependencies: ["MongoDB connection"],
      tradeoffs: "Splitting by resource keeps each route handler small, at the cost of repeating some shared logic (auth checks) across resources.",
      scaling: "Stateless Node process — horizontally scalable behind a load balancer if traffic grew.",
      failurePoints: "No rate limiting yet, so a resource-heavy client could degrade the whole API.",
      future: "Extract shared auth middleware once a fourth resource is added.",
      performance: "Stateless Node process — the layer most straightforward to scale horizontally if traffic grew.",
      security: "No rate limiting yet, so a single client could degrade the API for everyone.",
      code: "server/routes/",
    },
    accounts: {
      technology: "Express router + MongoDB user collection",
      purpose: "Handles user accounts and authentication as its own resource, separate from listings and bookings.",
      decision: "Kept as its own route module so authentication logic doesn't leak into unrelated resources.",
      alternatives: ["A single catch-all route — harder to reason about and test in isolation"],
      responsibilities: ["Register/login users", "Issue session/auth state"],
      input: "Credentials or registration data",
      output: "Auth confirmation / session",
      dependencies: ["MongoDB users collection"],
      tradeoffs: "Dedicated module simplicity vs. some duplicated validation boilerplate across resources.",
      scaling: "Stateless per request; session storage strategy would need revisiting at higher scale.",
      failurePoints: "No rate limiting on login attempts yet.",
      future: "Add rate limiting and a password-reset flow.",
      performance: "Low request volume expected relative to listings/bookings — not a current bottleneck.",
      security: "No rate limiting on login attempts yet — the most security-relevant gap in the current implementation.",
      code: "server/routes/accounts.js",
    },
    listings: {
      technology: "Express router + MongoDB listings collection",
      purpose: "Serves movie listing data — the resource users browse before booking.",
      decision: "Read-heavy listing data kept as its own resource so it can be cached or scaled independently of write-heavy booking traffic later.",
      alternatives: ["Merging listings into booking responses — would couple two very different access patterns"],
      responsibilities: ["Serve listing search/browse queries"],
      input: "Search/filter query params",
      output: "Listing documents",
      dependencies: ["MongoDB listings collection"],
      tradeoffs: "One more collection to keep in sync, but keeps read and write paths independent.",
      scaling: "Best candidate for a read cache if traffic grows, since listings change far less often than bookings.",
      failurePoints: "No pagination limit enforced yet on large result sets.",
      future: "Add pagination and a cache layer in front of this resource.",
      performance: "Read-heavy and the best candidate for caching — listings change far less often than bookings.",
      security: "Publicly readable by design; the main risk is unbounded query results, not data exposure.",
      code: "server/routes/listings.js",
    },
    bookings: {
      technology: "Express router + MongoDB bookings collection",
      purpose: "Tracks each user's booking history so they can see their own state, not just create new bookings.",
      decision: "Kept separate from listings because booking is a write-heavy, user-scoped operation with different consistency needs than browsing.",
      alternatives: ["Embedding bookings inside the user document — would make per-listing booking queries expensive"],
      responsibilities: ["Create bookings", "Return a user's booking history"],
      input: "Booking requests, user ID",
      output: "Booking confirmation / history list",
      dependencies: ["MongoDB bookings collection", "/accounts for identifying the user"],
      tradeoffs: "Fast per-user history queries at the cost of a join-like lookup back to listings for display.",
      scaling: "Write-heavy — the first candidate for its own database instance if traffic grows significantly.",
      failurePoints: "No double-booking check on concurrent requests for the same slot yet.",
      future: "Add an atomic check to prevent race-condition double bookings.",
      performance: "Write-heavy — the first resource likely to need its own scaling path under real load.",
      security: "No double-booking guard on concurrent requests — a correctness gap that's also a security-relevant race condition under concurrent access on the same slot.",
      code: "server/routes/bookings.js",
    },
    mongo: {
      technology: "MongoDB (single shared instance, three collections)",
      purpose: "A single shared document store backs all three resources — booking state stays consistent through plain request/response calls, no real-time layer needed.",
      decision: "MongoDB's document model fit the mostly-independent, mostly-flat shape of accounts/listings/bookings without a relational join layer.",
      alternatives: ["PostgreSQL — would suit this data fine too, but adds schema migration overhead this project's scope didn't need"],
      responsibilities: ["Persist accounts, listings, and bookings", "Serve queries from all three route modules"],
      input: "Writes from all three resources",
      output: "Query results",
      dependencies: ["A running MongoDB instance/connection string"],
      tradeoffs: "One shared database keeps the project simple to run and deploy, at the cost of no resource-level isolation if one collection's load spiked.",
      scaling: "A single instance today; the natural next step under real load is splitting hot collections (likely bookings) onto dedicated resources.",
      failurePoints: "No connection pooling tuning done yet — a spike in concurrent requests could exhaust default connections.",
      future: "Add indexes tuned to actual query patterns and explicit connection pool limits.",
      performance: "No connection pooling tuning done yet — a concurrency spike could exhaust default connections before any single collection becomes the bottleneck.",
      security: "A single shared instance/connection string is used across all three resources — no per-resource access scoping yet.",
      code: "server/db/connection.js",
    },
  },
};

const DIAGRAMS = {
  "automated-media-content-pipeline": {
    Component: MediaPipelineDiagram,
    path: "~/automated-media-content-pipeline/architecture",
    note: "5 stages · parallel Whisper + XTTS-v2 · daily cron",
  },
  "voice-synthesis-rest-api": {
    Component: VoiceApiDiagram,
    path: "~/voice-synthesis-api/architecture",
    note: "synchronous · single endpoint · warm model process",
  },
  "movie-booking-platform": {
    Component: MernDiagram,
    path: "~/movie-booking-platform/architecture",
    note: "3 REST resources · 1 shared MongoDB store",
  },
};

// Category order controls legend display order; label/category tables
// mirror what's hardcoded in each diagram's JSX so the panel header
// and legend chips can be derived without re-parsing the SVG.
const CATEGORY_ORDER = ["client", "ingestion", "compute", "ml", "api", "storage", "automation"];

export const NODE_LABELS = {
  "automated-media-content-pipeline": {
    ytdlp: "yt-dlp", highlight: "Highlight detection", clip: "Clip extraction",
    whisper: "Whisper", xtts: "XTTS-v2", assembly: "FFmpeg assembly", actions: "GitHub Actions",
  },
  "voice-synthesis-rest-api": {
    client: "Client", flask: "Flask endpoint", xttsWarm: "XTTS-v2 (warm model)", audio: "Audio response",
  },
  "movie-booking-platform": {
    frontend: "React frontend", expressApi: "Express.js API", accounts: "/accounts",
    listings: "/listings", bookings: "/bookings", mongo: "MongoDB",
  },
};

const NODE_CATEGORY = {
  "automated-media-content-pipeline": {
    ytdlp: "ingestion", highlight: "compute", clip: "compute",
    whisper: "ml", xtts: "ml", assembly: "compute", actions: "automation",
  },
  "voice-synthesis-rest-api": {
    client: "client", flask: "api", xttsWarm: "ml", audio: "api",
  },
  "movie-booking-platform": {
    frontend: "client", expressApi: "api", accounts: "api",
    listings: "api", bookings: "api", mongo: "storage",
  },
};

// The order a real request/data flow actually moves through each
// diagram — used by the "Trace a request" control below to sequentially
// highlight nodes via the same selection state the click-to-open panel
// already uses, rather than a separate visual system.
export const TRACE_ORDER = {
  "automated-media-content-pipeline": ["ytdlp", "highlight", "clip", "whisper", "xtts", "assembly", "actions"],
  "voice-synthesis-rest-api": ["client", "flask", "xttsWarm", "audio"],
  "movie-booking-platform": ["frontend", "expressApi", "accounts", "listings", "bookings", "mongo"],
};

export default function ArchitectureDiagram({ slug }) {
  const entry = DIAGRAMS[slug];
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [query, setQuery] = useState("");
  const [tracing, setTracing] = useState(false);
  const [traceStep, setTraceStep] = useState(0);
  const traceTimerRef = useRef(null);

  const nodesById = NODE_DETAILS[slug] || {};
  const labelsById = NODE_LABELS[slug] || {};
  const categoryList = CATEGORY_ORDER.filter((c) => Object.values(NODE_CATEGORY[slug] || {}).includes(c));
  const traceOrder = TRACE_ORDER[slug] || [];

  useEffect(() => {
    // Cancel any in-flight trace when the diagram itself unmounts or
    // switches project (e.g. via the prev/next nav on the case study page).
    return () => clearTimeout(traceTimerRef.current);
  }, [slug]);

  if (!entry) return null;
  const { Component, path, note } = entry;

  const selectedNode = selectedId
    ? {
        id: selectedId,
        label: labelsById[selectedId] || selectedId,
        category: NODE_CATEGORY[slug]?.[selectedId],
        detail: nodesById[selectedId],
      }
    : null;

  // Related projects for the selected node: other case studies that share
  // at least one technology with this node — computed from real stack
  // arrays, so it can't drift out of sync with a hand-maintained list.
  const relatedProjects = selectedNode
    ? projects
        .filter((p) => p.slug !== slug)
        .map((p) => {
          const nodeTech = selectedNode.detail?.technology || "";
          const shared = p.stack.filter((t) => nodeTech.toLowerCase().includes(t.toLowerCase()));
          return { slug: p.slug, name: p.name, sharedTech: shared };
        })
        .filter((p) => p.sharedTech.length > 0)
    : [];

  const handleSelect = (id) => {
    stopTrace();
    setSelectedId((cur) => (cur === id ? null : id));
  };
  const handleToggleCategory = (cat) => setActiveCategory((cur) => (cur === cat ? null : cat));

  function stopTrace() {
    clearTimeout(traceTimerRef.current);
    setTracing(false);
  }

  function runTrace() {
    if (traceOrder.length === 0) return;
    setTracing(true);
    setTraceStep(0);
    setSelectedId(traceOrder[0]);

    let i = 0;
    const advance = () => {
      i += 1;
      if (i >= traceOrder.length) {
        setTracing(false);
        return;
      }
      setTraceStep(i);
      setSelectedId(traceOrder[i]);
      traceTimerRef.current = setTimeout(advance, 1100);
    };
    traceTimerRef.current = setTimeout(advance, 1100);
  }

  const searchResults =
    query.trim().length > 0
      ? Object.entries(labelsById).filter(([id, label]) => label.toLowerCase().includes(query.trim().toLowerCase()) || id.toLowerCase().includes(query.trim().toLowerCase()))
      : [];

  return (
    <div className="pipeline-wrap arch-wrap">
      <div className="pipeline-head">
        <span className="path">{path}</span>
        <span>{note}</span>
      </div>

      <div className="arch-toolbar">
        <DiagramLegend categories={categoryList} active={activeCategory} onToggle={handleToggleCategory} />

        <div className="arch-toolbar-actions">
          <div className="arch-search">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes…"
              aria-label="Search diagram nodes"
            />
            {searchResults.length > 0 && (
              <ul className="arch-search-results">
                {searchResults.map(([id, label]) => (
                  <li key={id}>
                    <button type="button" onClick={() => { handleSelect(id); setQuery(""); }}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {traceOrder.length > 0 && (
            tracing ? (
              <button type="button" className="arch-trace-btn arch-trace-active" onClick={stopTrace}>
                ■ tracing ({traceStep + 1}/{traceOrder.length})
              </button>
            ) : (
              <button type="button" className="arch-trace-btn" onClick={runTrace}>
                ▶ Trace a request
              </button>
            )
          )}
        </div>
      </div>

      <div className={`arch-explorer${selectedNode ? " arch-explorer-panel-open" : ""}`}>
        <DiagramCanvas focusMode={focusMode} onToggleFocus={() => setFocusMode((f) => !f)} title={path}>
          <Component selectedId={selectedId} onSelect={handleSelect} activeCategory={activeCategory} nodesById={nodesById} />
        </DiagramCanvas>
        <NodeDetailPanel node={selectedNode} onClose={() => { stopTrace(); setSelectedId(null); }} relatedProjects={relatedProjects} />
      </div>
    </div>
  );
}
