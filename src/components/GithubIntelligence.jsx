import { useEffect, useState } from "react";
import { profile, projects, skills } from "../data/content";
import "./GithubIntelligence.css";

const API = "https://api.github.com";
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

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

// --- data hook -----------------------------------------------------------
// One combined fetch for everything on this page: the repo list, recent
// public events, and — capped to the 3 most-starred non-fork repos, to
// stay well clear of the unauthenticated GitHub API's 60 req/hr limit —
// each repo's release history. All three feed independent panels below,
// but share this one loading/error state.
function useGithubIntelligence() {
  const [state, setState] = useState({ status: "loading", repos: [], events: [], releases: {} });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [reposRes, eventsRes] = await Promise.all([
          fetch(`${API}/users/${profile.githubUser}/repos?per_page=100&sort=updated`),
          fetch(`${API}/users/${profile.githubUser}/events/public?per_page=100`),
        ]);
        if (!reposRes.ok || !eventsRes.ok) throw new Error("GitHub API request failed");
        const repos = await reposRes.json();
        const events = await eventsRes.json();
        if (cancelled || !Array.isArray(repos)) return;

        const releaseTargets = [...repos]
          .filter((r) => !r.fork && !r.archived)
          .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
          .slice(0, 3);

        const releaseResults = await Promise.allSettled(
          releaseTargets.map((r) =>
            fetch(`${API}/repos/${r.full_name}/releases?per_page=5`).then((res) => (res.ok ? res.json() : []))
          )
        );

        if (cancelled) return;

        const releases = {};
        releaseTargets.forEach((r, i) => {
          const result = releaseResults[i];
          releases[r.name] = result.status === "fulfilled" && Array.isArray(result.value) ? result.value : [];
        });

        setState({ status: "ready", repos, events: Array.isArray(events) ? events : [], releases });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: "error" }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

// --- commit frequency ------------------------------------------------------
function CommitFrequency({ events }) {
  const pushEvents = events.filter((e) => e.type === "PushEvent");
  const days = [...Array(14)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return dayKey(d);
  });
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  pushEvents.forEach((e) => {
    const key = dayKey(new Date(e.created_at));
    const commits = Array.isArray(e.payload?.commits) ? e.payload.commits.length : 1;
    if (key in counts) counts[key] += commits;
  });
  const max = Math.max(1, ...Object.values(counts));

  return (
    <div className="gi-panel">
      <h3>Commit frequency</h3>
      <p className="gi-sub">Push events over the last 14 days, from GitHub's public events feed (recent activity only — not full repo history).</p>
      <div className="gi-bars" role="img" aria-label="Bar chart of daily commit counts over the last 14 days">
        {days.map((d) => (
          <div className="gi-bar-col" key={d} title={`${d}: ${counts[d]} commit${counts[d] === 1 ? "" : "s"}`}>
            <div className="gi-bar" style={{ height: `${(counts[d] / max) * 100}%` }} />
            <span className="gi-bar-label">{d.slice(8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- language evolution ------------------------------------------------------
function LanguageEvolution({ repos }) {
  const timeline = [...repos]
    .filter((r) => r.language)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (timeline.length === 0) return null;

  return (
    <div className="gi-panel">
      <h3>Language evolution</h3>
      <p className="gi-sub">Primary language per repository, in the order each repo was created — an approximation of when each technology was picked up, not a claim about proficiency.</p>
      <div className="gi-evo-track">
        {timeline.map((r) => (
          <div className="gi-evo-item" key={r.id} title={r.name}>
            <span className="gi-evo-dot" style={{ background: LANGUAGE_COLORS[r.language] || "var(--accent)" }} />
            <span className="gi-evo-lang">{r.language}</span>
            <span className="gi-evo-year">{new Date(r.created_at).getFullYear()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- repository health ------------------------------------------------------
function healthOf(repo) {
  if (repo.archived) return { key: "archived", label: "archived" };
  const monthsSincePush = (Date.now() - new Date(repo.pushed_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (monthsSincePush > 12) return { key: "stale", label: "stale" };
  if (monthsSincePush > 4) return { key: "quiet", label: "quiet" };
  return { key: "active", label: "active" };
}

function RepositoryHealth({ repos }) {
  const real = [...repos].filter((r) => !r.fork).sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
  const counts = real.reduce((acc, r) => {
    const h = healthOf(r).key;
    acc[h] = (acc[h] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="gi-panel">
      <h3>Repository health</h3>
      <p className="gi-sub">Active = pushed within 4 months. Quiet = 4–12 months. Stale = 12+ months. Computed from real push timestamps, not a manual label.</p>
      <div className="gi-health-summary">
        {["active", "quiet", "stale", "archived"].map((k) => (
          <div className="gi-health-stat" key={k}>
            <div className={`num gi-health-${k}`}>{counts[k] || 0}</div>
            <div className="label">{k}</div>
          </div>
        ))}
      </div>
      <ul className="gi-health-list">
        {real.slice(0, 8).map((r) => {
          const h = healthOf(r);
          return (
            <li key={r.id}>
              <span className={`gi-health-dot gi-health-${h.key}`} />
              <span className="gi-health-name">{r.name}</span>
              <span className="gi-health-meta">
                {r.license?.spdx_id && r.license.spdx_id !== "NOASSERTION" ? r.license.spdx_id : "no license"}
                {" · "}
                {r.open_issues_count} open issue{r.open_issues_count === 1 ? "" : "s"}
              </span>
              <span className={`gi-health-badge gi-health-${h.key}`}>{h.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- contribution breakdown ------------------------------------------------------
const EVENT_LABELS = {
  PushEvent: "Pushes",
  PullRequestEvent: "Pull requests",
  IssuesEvent: "Issues",
  IssueCommentEvent: "Comments",
  CreateEvent: "Created refs/repos",
  WatchEvent: "Stars given",
  ForkEvent: "Forks",
  ReleaseEvent: "Releases",
  PublicEvent: "Open-sourced",
};

function ContributionBreakdown({ events }) {
  const counts = events.reduce((acc, e) => {
    if (!EVENT_LABELS[e.type]) return acc;
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  if (entries.length === 0) return null;

  return (
    <div className="gi-panel">
      <h3>Contribution breakdown</h3>
      <p className="gi-sub">Event types from the public activity feed (GitHub returns roughly the last 90 days) — a shape of activity, not a full historical count.</p>
      <ul className="gi-contrib-list">
        {entries.map(([type, count]) => (
          <li key={type}>
            <span className="gi-contrib-label">{EVENT_LABELS[type]}</span>
            <span className="gi-contrib-bar"><span style={{ width: `${(count / max) * 100}%` }} /></span>
            <span className="gi-contrib-count">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- release timeline ------------------------------------------------------
function ReleaseTimeline({ releases }) {
  const all = Object.entries(releases)
    .flatMap(([repo, rels]) => rels.map((r) => ({ repo, ...r })))
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
    .slice(0, 8);

  return (
    <div className="gi-panel">
      <h3>Release timeline</h3>
      <p className="gi-sub">Tagged releases from the {Object.keys(releases).length} most-starred active repositories.</p>
      {all.length === 0 ? (
        <p className="gi-empty">No tagged releases yet on the repos checked — most work here ships via direct commits/deploys rather than versioned releases.</p>
      ) : (
        <ul className="gi-release-list">
          {all.map((r) => (
            <li key={`${r.repo}-${r.id}`}>
              <a href={r.html_url} target="_blank" rel="noopener noreferrer" className="gi-release-tag">{r.tag_name}</a>
              <span className="gi-release-repo">{r.repo}</span>
              <span className="gi-release-date">{new Date(r.published_at || r.created_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// --- skill distribution (local data, no API call) ------------------------------------------------------
function SkillDistribution() {
  const categories = [
    { label: "Languages", items: skills.languages },
    { label: "Backend", items: skills.backend },
    { label: "Frontend", items: skills.frontend },
    { label: "AI / Automation", items: skills.aiAutomation },
    { label: "Databases", items: skills.databases },
    { label: "DevOps", items: skills.devops },
  ];
  const max = Math.max(...categories.map((c) => c.items.length));

  return (
    <div className="gi-panel">
      <h3>Skill distribution</h3>
      <p className="gi-sub">Count of listed technologies per category — breadth, not proficiency.</p>
      <ul className="gi-contrib-list">
        {categories.map((c) => (
          <li key={c.label}>
            <span className="gi-contrib-label">{c.label}</span>
            <span className="gi-contrib-bar"><span style={{ width: `${(c.items.length / max) * 100}%` }} /></span>
            <span className="gi-contrib-count">{c.items.length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- architecture relationships (local data, no API call) ------------------------------------------------------
function ArchitectureRelationships() {
  // Which shipped projects share technologies — a real relationship
  // derived from the same stack arrays used on each case study page,
  // not a separately maintained "relationships" list that could drift.
  const pairs = [];
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const shared = projects[i].stack.filter((t) => projects[j].stack.includes(t));
      if (shared.length > 0) pairs.push({ a: projects[i], b: projects[j], shared });
    }
  }

  if (pairs.length === 0) return null;

  return (
    <div className="gi-panel gi-panel-wide">
      <h3>Architecture relationships</h3>
      <p className="gi-sub">Shipped projects that share technology, computed directly from each case study's tech stack.</p>
      <ul className="gi-relation-list">
        {pairs.map((p, i) => (
          <li key={i}>
            <span className="gi-relation-pair">{p.a.name} <span aria-hidden="true">↔</span> {p.b.name}</span>
            <span className="gi-relation-shared">{p.shared.join(", ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function GithubIntelligence() {
  const { status, repos, events, releases } = useGithubIntelligence();

  if (status === "loading") {
    return (
      <div className="gi-state">
        <span className="gh-spinner" />
        <span>Analyzing repository and activity data…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="gi-state">
        <span>
          Couldn't reach the GitHub API right now — rate-limited or offline. View the profile directly at{" "}
          <a href={profile.github} target="_blank" rel="noopener noreferrer">github.com/{profile.githubUser}</a>.
        </span>
      </div>
    );
  }

  return (
    <div className="gi-grid">
      <CommitFrequency events={events} />
      <RepositoryHealth repos={repos} />
      <LanguageEvolution repos={repos} />
      <ContributionBreakdown events={events} />
      <ReleaseTimeline releases={releases} />
      <SkillDistribution />
      <ArchitectureRelationships />
    </div>
  );
}
