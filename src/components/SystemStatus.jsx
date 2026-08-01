import { useEffect, useState } from "react";
import { profile } from "../data/content";
import "./SystemStatus.css";

const API = "https://api.github.com";
// The pipeline this status bar reports on — the one project in the
// portfolio that actually runs unattended, on a schedule, in CI.
const PIPELINE_REPO = "yt-shorts-auto";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Maps a GitHub Actions run onto a small, honest status vocabulary.
// Never invents a state the API didn't actually return.
function readRunState(run) {
  if (!run) return null;
  if (run.status !== "completed") {
    return { key: "running", label: run.status.replace("_", " ") };
  }
  if (run.conclusion === "success") return { key: "success", label: "passing" };
  if (run.conclusion === "failure") return { key: "failure", label: "failed" };
  return { key: "neutral", label: run.conclusion || "unknown" };
}

/**
 * A small live status strip for the hero — real signals only:
 * - CI/CD: the latest actual GitHub Actions run on the media pipeline repo
 * - Last automated commit: when that repo last had state pushed back to it
 * - Availability: the same static, real status shown elsewhere in the site
 *
 * Every card fails silently (renders nothing) rather than showing a
 * fabricated or stale number if the GitHub API is unreachable or
 * rate-limited — consistent with GithubPanel / GithubActivity.
 */
export default function SystemStatus() {
  const [run, setRun] = useState(undefined); // undefined = loading, null = unavailable
  const [pushedAt, setPushedAt] = useState(undefined);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [runsRes, repoRes] = await Promise.all([
          fetch(`${API}/repos/${profile.githubUser}/${PIPELINE_REPO}/actions/runs?per_page=1`),
          fetch(`${API}/repos/${profile.githubUser}/${PIPELINE_REPO}`),
        ]);

        if (!cancelled) {
          if (runsRes.ok) {
            const data = await runsRes.json();
            setRun(Array.isArray(data.workflow_runs) && data.workflow_runs.length ? data.workflow_runs[0] : null);
          } else {
            setRun(null);
          }
        }

        if (!cancelled) {
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            setPushedAt(repoData.pushed_at || null);
          } else {
            setPushedAt(null);
          }
        }
      } catch {
        if (!cancelled) {
          setRun(null);
          setPushedAt(null);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const runState = readRunState(run);
  const isLoading = run === undefined && pushedAt === undefined;

  return (
    <div className="sys-status" role="group" aria-label="Live engineering status">
      <div className="sys-chip">
        <span className="sys-chip-label">status</span>
        <span className="sys-chip-value">
          <span className="sys-dot sys-dot-live" />
          {profile.status.includes("Open to") ? "open to work" : "available"}
        </span>
      </div>

      <div className="sys-chip">
        <span className="sys-chip-label">ci/cd · {PIPELINE_REPO}</span>
        {isLoading && (
          <span className="sys-chip-value sys-loading">
            <span className="sys-spinner" /> checking…
          </span>
        )}
        {!isLoading && runState && (
          <a
            className={`sys-chip-value sys-link sys-${runState.key}`}
            href={run.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className={`sys-dot sys-dot-${runState.key === "success" ? "live" : runState.key === "failure" ? "danger" : "warn"}`} />
            {runState.label}
            <span className="sys-chip-meta">#{run.run_number} · {timeAgo(run.updated_at)}</span>
          </a>
        )}
        {!isLoading && !runState && (
          <a className="sys-chip-value sys-link" href={`https://github.com/${profile.githubUser}/${PIPELINE_REPO}/actions`} target="_blank" rel="noopener noreferrer">
            view on github
          </a>
        )}
      </div>

      <div className="sys-chip">
        <span className="sys-chip-label">last automated run</span>
        <span className="sys-chip-value">
          {pushedAt === undefined && (
            <span className="sys-loading"><span className="sys-spinner" /> checking…</span>
          )}
          {pushedAt === null && "—"}
          {pushedAt && <><span className="sys-dot sys-dot-live" />{timeAgo(pushedAt)}</>}
        </span>
      </div>

      <div className="sys-chip sys-chip-static">
        <span className="sys-chip-label">this site</span>
        <span className="sys-chip-value">SSR-prerendered · static</span>
      </div>
    </div>
  );
}
