import { useEffect, useState } from "react";
import { profile } from "../data/content";
import "./DeploymentTimeline.css";

const API = "https://api.github.com";
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

function runStatus(run) {
  if (run.status !== "completed") return { key: "running", label: run.status.replace("_", " ") };
  if (run.conclusion === "success") return { key: "success", label: "success" };
  if (run.conclusion === "failure") return { key: "failure", label: "failure" };
  return { key: "neutral", label: run.conclusion || "unknown" };
}

/**
 * Real run history for the one project in the portfolio that actually
 * has a CI/CD pipeline — pulled live from the GitHub Actions API, not
 * a mocked timeline. Renders a plain fallback if the API is
 * unreachable, same as SystemStatus/GithubPanel, rather than showing
 * fabricated runs.
 */
export default function DeploymentTimeline() {
  const [runs, setRuns] = useState(undefined); // undefined = loading, null = unavailable

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/repos/${profile.githubUser}/${PIPELINE_REPO}/actions/runs?per_page=8`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setRuns(Array.isArray(data.workflow_runs) ? data.workflow_runs : []);
      })
      .catch(() => {
        if (!cancelled) setRuns(null);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="deploy-timeline">
      <div className="deploy-timeline-head">
        <h3>Deployment timeline</h3>
        <span className="deploy-timeline-sub">{PIPELINE_REPO} · scheduled runs</span>
      </div>

      {runs === undefined && (
        <div className="deploy-timeline-state"><span className="deploy-spinner" /> Fetching run history…</div>
      )}

      {runs === null && (
        <div className="deploy-timeline-state">
          Couldn't reach the GitHub Actions API right now — view runs directly at{" "}
          <a href={`https://github.com/${profile.githubUser}/${PIPELINE_REPO}/actions`} target="_blank" rel="noopener noreferrer">
            github.com/{profile.githubUser}/{PIPELINE_REPO}/actions
          </a>.
        </div>
      )}

      {runs !== undefined && runs !== null && runs.length === 0 && (
        <div className="deploy-timeline-state">No workflow runs returned by the API right now.</div>
      )}

      {runs && runs.length > 0 && (
        <ol className="deploy-timeline-list">
          {runs.map((run) => {
            const s = runStatus(run);
            return (
              <li key={run.id} className={`deploy-item deploy-${s.key}`}>
                <span className="deploy-dot" />
                <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="deploy-item-main">
                  <span className="deploy-item-title">{run.display_title || run.name || "pipeline run"}</span>
                  <span className="deploy-item-meta">
                    #{run.run_number} · {s.label} · {timeAgo(run.updated_at)}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
