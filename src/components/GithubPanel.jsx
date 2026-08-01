import { useEffect, useState } from "react";
import { profile } from "../data/content";
import useSpotlight from "../hooks/useSpotlight";
import "./GithubPanel.css";

const API = "https://api.github.com";

// Official GitHub brand colors for the languages that actually appear
// on this profile — falls back to the theme accent for anything else,
// so nothing here is invented per-repo, just a known, public mapping.
const LANGUAGE_COLORS = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "C++": "#f34b7d",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  "Jupyter Notebook": "#DA5B0B",
};

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function GithubPanel() {
  const [status, setStatus] = useState("loading"); // loading | error | empty | ready
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const repoSpotlight = useSpotlight();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`${API}/users/${profile.githubUser}`),
          fetch(`${API}/users/${profile.githubUser}/repos?per_page=100&sort=updated`),
        ]);
        if (!userRes.ok || !reposRes.ok) throw new Error("GitHub API request failed");
        const userData = await userRes.json();
        const repoData = await reposRes.json();
        if (cancelled) return;

        if (!Array.isArray(repoData) || repoData.length === 0) {
          setStatus("empty");
          setUser(userData);
          return;
        }

        setUser(userData);
        setRepos(repoData);
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
      <div className="gh-panel gh-state">
        <span className="gh-spinner" />
        <span>Fetching live data from the GitHub REST API…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="gh-panel gh-state">
        <span>
          Couldn't reach the GitHub API right now — rate-limited or offline. View the profile directly at{" "}
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            github.com/{profile.githubUser}
          </a>
          .
        </span>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="gh-panel gh-state">
        <span>No public repositories returned by the API right now.</span>
      </div>
    );
  }

  const languageCounts = repos.reduce((acc, r) => {
    if (!r.language) return acc;
    acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const topLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  // "Top repositories": ranked by stars first (signals real external
  // interest), then by recency — a closer proxy for what a recruiter
  // would want surfaced than a raw "most recently touched" list.
  const topRepos = [...repos]
    .filter((r) => !r.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0) || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 6);

  return (
    <div className="gh-panel">
      <div className="gh-stats-row">
        <div className="gh-stat"><div className="num">{user?.public_repos ?? repos.length}</div><div className="label">public repos</div></div>
        <div className="gh-stat"><div className="num">{totalStars}</div><div className="label">stars</div></div>
        <div className="gh-stat"><div className="num">{totalForks}</div><div className="label">forks</div></div>
        <div className="gh-stat"><div className="num">{user?.followers ?? "—"}</div><div className="label">followers</div></div>
      </div>

      <h4 className="gh-subhead">Top repositories</h4>
      <div className="gh-repo-grid" ref={repoSpotlight}>
        {topRepos.map((r) => (
          <a
            className="gh-repo-card spotlight"
            key={r.id}
            href={r.html_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="gh-repo-card-head">
              <span className="gh-repo-name">{r.name}</span>
              {r.stargazers_count > 0 && (
                <span className="gh-repo-stars">★ {r.stargazers_count}</span>
              )}
            </div>
            {r.description && <p className="gh-repo-desc">{r.description}</p>}
            <div className="gh-repo-card-foot">
              {r.language && (
                <span className="gh-repo-lang">
                  <span
                    className="gh-lang-dot"
                    style={{ background: LANGUAGE_COLORS[r.language] || "var(--accent)" }}
                  />
                  {r.language}
                </span>
              )}
              {r.forks_count > 0 && <span>⑂ {r.forks_count}</span>}
              <span>updated {timeAgo(r.pushed_at)}</span>
            </div>
          </a>
        ))}
      </div>

      <div className="gh-lang-block">
        <h4>Top languages across all repos</h4>
        <ul className="gh-lang-list">
          {topLanguages.map(([lang, count]) => (
            <li key={lang}>
              <span>{lang}</span>
              <span className="gh-lang-bar">
                <span
                  style={{
                    width: `${(count / repos.length) * 100}%`,
                    background: LANGUAGE_COLORS[lang] || "var(--accent)",
                  }}
                />
              </span>
              <span className="gh-lang-count">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
