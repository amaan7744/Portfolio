import { useEffect, useState } from "react";
import { profile } from "../data/content";
import "./GithubActivity.css";

const API = "https://api.github.com";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Formats a raw GitHub event into a short human line + icon. Only
// renders fields the API actually returned for that event — GitHub
// has been trimming payload fields (e.g. push commit counts) for
// performance, so this never fabricates a count or summary that
// wasn't present in the response.
function describeEvent(event) {
  const repoName = event.repo?.name?.split("/")?.[1] || event.repo?.name || "a repository";
  switch (event.type) {
    case "PushEvent": {
      const branch = event.payload?.ref ? event.payload.ref.replace("refs/heads/", "") : null;
      const count = Array.isArray(event.payload?.commits) ? event.payload.commits.length : null;
      return {
        icon: "↑",
        text: count
          ? `pushed ${count} commit${count === 1 ? "" : "s"}${branch ? ` to ${branch}` : ""} in`
          : `pushed to ${branch || repoName} in`,
        repo: repoName,
      };
    }
    case "CreateEvent":
      return {
        icon: "+",
        text: event.payload?.ref_type === "repository" ? "created repository" : `created ${event.payload?.ref_type || "ref"} in`,
        repo: repoName,
      };
    case "PullRequestEvent":
      return { icon: "⇄", text: `${event.payload?.action || "updated"} a pull request in`, repo: repoName };
    case "IssuesEvent":
      return { icon: "●", text: `${event.payload?.action || "updated"} an issue in`, repo: repoName };
    case "IssueCommentEvent":
      return { icon: "💬", text: "commented on an issue in", repo: repoName };
    case "WatchEvent":
      return { icon: "★", text: "starred", repo: repoName };
    case "ForkEvent":
      return { icon: "⑂", text: "forked", repo: repoName };
    case "ReleaseEvent":
      return { icon: "◆", text: `${event.payload?.action || "published"} a release in`, repo: repoName };
    case "PublicEvent":
      return { icon: "◇", text: "open-sourced", repo: repoName };
    default:
      return null;
  }
}

export default function GithubActivity() {
  const [status, setStatus] = useState("loading"); // loading | error | empty | ready
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`${API}/users/${profile.githubUser}/events/public?per_page=15`);
        if (!res.ok) throw new Error("GitHub events API request failed");
        const data = await res.json();
        if (cancelled) return;

        const described = Array.isArray(data)
          ? data
              .map((e) => {
                const info = describeEvent(e);
                return info ? { ...info, id: e.id, createdAt: e.created_at, repoFull: e.repo?.name } : null;
              })
              .filter(Boolean)
              .slice(0, 6)
          : [];

        if (described.length === 0) {
          setStatus("empty");
          return;
        }
        setEvents(described);
        setStatus("ready");
      } catch (err) {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="gh-activity gh-state">
        <span className="gh-spinner" />
        <span>Fetching recent public activity…</span>
      </div>
    );
  }

  if (status === "error" || status === "empty") {
    return null; // non-critical widget — fail silently rather than clutter the page with a second error message
  }

  return (
    <div className="gh-activity">
      <h4 className="gh-subhead">Recent activity</h4>
      <ul className="gh-activity-list">
        {events.map((e) => (
          <li key={e.id}>
            <span className="gh-activity-icon" aria-hidden="true">{e.icon}</span>
            <span className="gh-activity-text">
              {e.text}{" "}
              <a
                href={`https://github.com/${e.repoFull}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {e.repo}
              </a>
            </span>
            <span className="gh-activity-time">{timeAgo(e.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
