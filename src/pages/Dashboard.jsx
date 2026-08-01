import { projects, skills, profile, education } from "../data/content";
import Seo from "../components/Seo";
import { breadcrumbSchema } from "../lib/schema";
import SystemStatus from "../components/SystemStatus";
import DeploymentTimeline from "../components/DeploymentTimeline";
import GithubPanel from "../components/GithubPanel";
import GithubActivity from "../components/GithubActivity";
import GithubIntelligence from "../components/GithubIntelligence";
import "./Dashboard.css";

const PRINCIPLES = [
  {
    title: "Decouple early",
    body: "Splitting the media pipeline into independent stages made it possible to extract the TTS stage into its own REST API later, without touching the rest of the pipeline.",
  },
  {
    title: "Don't add infrastructure you don't need",
    body: "The daily pipeline commits state to git instead of standing up a database, and runs on scheduled GitHub Actions instead of a server that has to stay up 24/7.",
  },
  {
    title: "Match the tool to the actual constraint",
    body: "A synchronous Flask service with a warm model was the right call once the bottleneck was identified as model load time, not request concurrency.",
  },
  {
    title: "Say what isn't done yet",
    body: "Every project here lists real failure points and a future roadmap — no rate limiting, no double-booking guard, no persistent inference worker yet. Naming the gap is part of the engineering.",
  },
];

function techCategories() {
  return [
    { label: "Languages", items: skills.languages },
    { label: "Backend", items: skills.backend },
    { label: "Frontend", items: skills.frontend },
    { label: "AI / Automation", items: skills.aiAutomation },
    { label: "Databases", items: skills.databases },
    { label: "DevOps", items: skills.devops },
  ];
}

function ProjectMetrics() {
  const stackSet = new Set(projects.flatMap((p) => p.stack));
  const repoLinks = new Set(projects.map((p) => p.github));

  return (
    <div className="dash-panel">
      <h3>Project metrics</h3>
      <div className="dash-metric-row">
        <div className="dash-metric"><div className="num">{projects.length}</div><div className="label">shipped projects</div></div>
        <div className="dash-metric"><div className="num">{repoLinks.size}</div><div className="label">repositories</div></div>
        <div className="dash-metric"><div className="num">{stackSet.size}</div><div className="label">distinct technologies used</div></div>
      </div>
      <ul className="dash-project-list">
        {projects.map((p) => (
          <li key={p.slug}>
            <span className="dash-project-name">{p.name}</span>
            <span className="dash-project-stack">{p.stack.slice(0, 3).join(" · ")}{p.stack.length > 3 ? ` +${p.stack.length - 3}` : ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TechnologyUsage() {
  return (
    <div className="dash-panel">
      <h3>Technology usage</h3>
      <p className="dash-panel-sub">By category, as actually used across the projects above — not a proficiency score.</p>
      <div className="dash-tech-grid">
        {techCategories().map((cat) => (
          <div key={cat.label} className="dash-tech-cat">
            <span className="dash-tech-cat-label">{cat.label}</span>
            <div className="dash-tech-tags">
              {cat.items.map((t) => <span className="tag" key={t}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurrentFocus() {
  return (
    <div className="dash-panel">
      <h3>Current focus</h3>
      <ul className="dash-focus-list">
        <li><span className="dash-focus-dot" />{profile.status}</li>
        <li><span className="dash-focus-dot" />{education.degree} — {education.school} ({education.status})</li>
        <li><span className="dash-focus-dot" />Extending the media pipeline's TTS extraction pattern to other reusable services</li>
      </ul>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="page-enter">
      <Seo
        title="Engineering Dashboard"
        description="A live control-center view of Aman Mulani's engineering work: real CI/CD status, GitHub activity, repository health, commit frequency, language evolution, and project metrics."
        path="/dashboard"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Dashboard", path: "/dashboard" }])}
      />

      <section className="page-hero">
        <div className="wrap">
          <span className="section-tag">dashboard</span>
          <h1 className="section-title" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
            Engineering control center.
          </h1>
          <p className="section-desc">
            Every number and status here is fetched live from the GitHub API or read directly from
            the project data — nothing on this page is a mocked or hardcoded metric.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <SystemStatus />
        </div>
      </section>

      <section className="dash-grid-section">
        <div className="wrap dash-grid">
          <DeploymentTimeline />
          <ProjectMetrics />
          <TechnologyUsage />
          <CurrentFocus />
          <div className="dash-panel dash-panel-wide">
            <h3>Engineering principles</h3>
            <div className="dash-principles">
              {PRINCIPLES.map((p) => (
                <div className="dash-principle" key={p.title}>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2 className="dash-section-heading">Repository activity &amp; technology breakdown</h2>
          <GithubPanel />
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2 className="dash-section-heading">Live GitHub activity</h2>
          <GithubActivity />
        </div>
      </section>

      <section>
        <div className="wrap">
          <h2 className="dash-section-heading">GitHub intelligence</h2>
          <p className="dash-panel-sub" style={{ marginBottom: 20 }}>
            Analysis derived from live repository and activity data, plus the site's own project data —
            not a display of raw numbers, an actual read on health, evolution, and relationships.
          </p>
          <GithubIntelligence />
        </div>
      </section>
    </div>
  );
}
