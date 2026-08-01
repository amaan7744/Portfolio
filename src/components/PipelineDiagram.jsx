import { useEffect, useState } from "react";
import "./PipelineDiagram.css";

// Cycles through the real stages of the daily cron run so the hero
// reads as a live system rather than a static illustration — the
// only thing that changes is a text label, so it costs nothing on
// Lighthouse and never fights the SVG animations for attention.
const STATUS_STEPS = [
  "retrieving source…",
  "detecting highlights…",
  "transcribing (whisper)…",
  "synthesizing voice (xtts-v2)…",
  "assembling vertical clip…",
  "committing rotation state…",
];

function StatusTicker() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STATUS_STEPS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="pipeline-status">
      <span className="pipeline-status-dot" />
      {STATUS_STEPS[step]}
    </span>
  );
}

// Each node is focusable/hoverable and carries a real, specific
// explanation of what that stage does — makes the diagram function as
// a tiny architecture explorer instead of a static illustration, at
// zero extra dependency cost (native SVG <title> gives a hover
// tooltip and an accessible name for free).
function Node({ x, y, w = 100, h = 50, label, sub, explain, cron = false, labelFill }) {
  const cx = x + w / 2;
  return (
    <g className="node" tabIndex={0} role="img" aria-label={`${label} — ${explain}`}>
      <title>{explain}</title>
      <rect className={cron ? "node-box cron-badge" : "node-box"} x={x} y={y} width={w} height={h} rx="8" />
      <text className="node-label" x={cx} y={y + 22} textAnchor="middle" fill={labelFill}>{label}</text>
      <text className={cron ? "cron-text" : "node-sub"} x={cx} y={y + 36} textAnchor="middle">{sub}</text>
    </g>
  );
}

// Real diagram of the automated media pipeline — the most complex
// system in the portfolio — used as the hero's signature element
// instead of a generic illustration.
export default function PipelineDiagram() {
  return (
    <div className="pipeline-wrap">
      <div className="pipeline-head">
        <span className="path">~/automated-media-content-pipeline/workflow.yml</span>
        <StatusTicker />
      </div>
      <svg
        className="pipeline-svg"
        viewBox="0 0 980 190"
        role="img"
        aria-label="Diagram of the automated media pipeline: source retrieval feeds Whisper transcription and XTTS-v2 voice synthesis, which feed FFmpeg assembly, triggered daily by a GitHub Actions cron job, ending in an automated commit."
      >
        <path className="flow-line" d="M110,95 H210" />
        <path className="flow-line" d="M310,95 H360 V50 H410" />
        <path className="flow-line" d="M310,95 H360 V140 H410" />
        <path className="flow-line" d="M510,50 H560 V95 H610" />
        <path className="flow-line" d="M510,140 H560 V95 H610" />
        <path className="flow-line" d="M710,95 H810" />

        <circle className="flow-dot" r="3">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M110,95 H210 M310,95 H360 V50 H410" />
        </circle>
        <circle className="flow-dot" r="3">
          <animateMotion dur="3.6s" repeatCount="indefinite" begin="0.4s" path="M110,95 H210 M310,95 H360 V140 H410" />
        </circle>
        <circle className="flow-dot" r="3">
          <animateMotion dur="2.6s" repeatCount="indefinite" begin="1.1s" path="M510,50 H560 V95 H610" />
        </circle>
        <circle className="flow-dot" r="3">
          <animateMotion dur="2.6s" repeatCount="indefinite" begin="1.5s" path="M510,140 H560 V95 H610" />
        </circle>
        <circle className="flow-dot" r="3">
          <animateMotion dur="2s" repeatCount="indefinite" begin="2.2s" path="M710,95 H810" />
        </circle>

        <Node
          x={10} y={70} label="yt-dlp" sub="source retrieval"
          explain="Pulls the source video from YouTube via yt-dlp at the start of each daily run."
        />
        <Node
          x={210} y={25} label="Whisper" sub="transcription"
          explain="OpenAI Whisper transcribes the extracted highlight clip to generate accurate subtitles."
        />
        <Node
          x={210} y={115} label="XTTS-v2" sub="voice synthesis"
          explain="Coqui XTTS-v2 re-synthesizes the audio track — a separate ML model running in parallel with transcription."
        />
        <Node
          x={410} y={25} label="FFmpeg" sub="clip extraction"
          explain="FFmpeg extracts the detected highlight window from the source video."
        />
        <Node
          x={410} y={115} label="FFmpeg" sub="video assembly"
          explain="FFmpeg reassembles the transcribed, voice-synthesized audio with video into a vertical-format clip."
        />
        <Node
          x={610} y={70} label="Output" sub="vertical video"
          explain="Final vertical-format video ready for publishing — the artifact the whole pipeline exists to produce."
        />
        <Node
          x={810} y={70} w={160} label="GitHub Actions" sub="daily cron → auto-commit" cron
          labelFill="var(--live)"
          explain="A GitHub Actions workflow on a daily cron trigger runs this entire pipeline headlessly and commits the updated rotation state back to the repo — no server, no manual trigger."
        />
      </svg>
    </div>
  );
}
