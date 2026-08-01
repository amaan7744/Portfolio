import { Link, useParams, Navigate } from "react-router-dom";
import { projects } from "../data/content";
import Seo from "../components/Seo";
import ArchitectureDiagram, { NODE_DETAILS, NODE_LABELS, TRACE_ORDER } from "../components/ArchitectureDiagram";
import useMagnetic from "../hooks/useMagnetic";
import { breadcrumbSchema, projectSchema } from "../lib/schema";
import "./ProjectDetail.css";

function estimateReadingTime(project) {
  const words = [
    ...(project.requirements || []), ...(project.problem || []), ...(project.architecture || []), ...(project.apiDesign || []),
    ...(project.database || []), ...(project.infrastructure || []), ...(project.deployment || []),
    ...(project.engineering || []), ...(project.challenges || []), ...(project.performance || []),
    ...(project.scaling || []), ...(project.lessons || []), ...(project.roadmap || []),
    project.executiveSummary || "", project.authentication || "", project.monitoring || "",
  ]
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function Block({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="pd-block">
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function TextBlock({ title, text }) {
  if (!text) return null;
  return (
    <div className="pd-block">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);
  const index = projects.findIndex((p) => p.slug === slug);
  const magRef = useMagnetic(0.3);

  if (!project) return <Navigate to="/projects" replace />;

  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  const readingTime = estimateReadingTime(project);

  const nodeDetails = NODE_DETAILS[project.slug] || {};
  const nodeLabels = NODE_LABELS[project.slug] || {};
  const trace = (TRACE_ORDER[project.slug] || []).map((id) => ({
    id,
    label: nodeLabels[id] || id,
    performance: nodeDetails[id]?.performance,
  }));
  const codeLocations = Object.entries(nodeDetails)
    .filter(([, d]) => d.code && d.code !== "N/A — external caller")
    .map(([id, d]) => ({ id, code: d.code, label: nodeLabels[id] || id }));

  return (
    <div className="page-enter">
      <Seo
        title={project.name}
        description={project.tagline}
        path={`/projects/${project.slug}`}
        jsonLd={[
          projectSchema(project),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.name, path: `/projects/${project.slug}` },
          ]),
        ]}
      />
      <section className="pd-hero">
        <div className="wrap">
          <Link to="/projects" className="pd-back">← all projects</Link>
          <div className="section-tag">{project.type} · {readingTime} min read</div>
          <h1 className="pd-title">{project.name}</h1>
          <p className="pd-tagline">{project.tagline}</p>
          {project.executiveSummary && <p className="pd-exec-summary">{project.executiveSummary}</p>}
          <div className="hero-tags" style={{ marginTop: 22 }}>
            {project.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
          </div>
          <div className="pd-links">
            <a ref={magRef} className="btn-secondary" href={project.github} target="_blank" rel="noopener noreferrer">↗ View on GitHub</a>
          </div>
        </div>
      </section>

      <section className="pd-diagram">
        <div className="wrap">
          <ArchitectureDiagram slug={project.slug} />
        </div>
      </section>

      <section className="pd-body">
        <div className="wrap pd-grid">
          <Block title="Requirements" items={project.requirements} />
          <Block title="Problem" items={project.problem} />
          <Block title="Architecture" items={project.architecture} />
          <Block title="API Design" items={project.apiDesign} />
          <Block title="Database" items={project.database} />
          <TextBlock title="Authentication" text={project.authentication} />
          <Block title="Infrastructure" items={project.infrastructure} />
          <Block title="Deployment" items={project.deployment} />
          <TextBlock title="Monitoring" text={project.monitoring} />
          <Block title="Engineering Decisions" items={project.engineering} />
          <Block title="Challenges &amp; Trade-offs" items={project.challenges} />
          <Block title="Performance" items={project.performance} />
          <Block title="Scaling" items={project.scaling} />
          <Block title="Lessons Learned" items={project.lessons} />
          <Block title="Future Roadmap" items={project.roadmap} />
        </div>
      </section>

      {trace.length > 0 && (
        <section className="pd-body pd-timeline-section">
          <div className="wrap">
            <h3 className="pd-timeline-heading">Process timeline</h3>
            <p className="pd-timeline-sub">
              The real execution order of this system, stage by stage — not a development calendar, the actual
              request/data flow, with what dominates time at each step (also explorable interactively above via
              "Trace a request").
            </p>
            <ol className="pd-timeline-list">
              {trace.map((step, i) => (
                <li key={step.id}>
                  <span className="pd-timeline-num">{i + 1}</span>
                  <span className="pd-timeline-label">{step.label}</span>
                  {step.performance && <span className="pd-timeline-note">{step.performance}</span>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {codeLocations.length > 0 && (
        <section className="pd-body pd-code-section">
          <div className="wrap">
            <h3 className="pd-timeline-heading">Code examples</h3>
            <p className="pd-timeline-sub">
              Where each piece actually lives in the repository — pointers to the real source, not reconstructed
              snippets. <a href={project.github} target="_blank" rel="noopener noreferrer">Browse the full repo →</a>
            </p>
            <ul className="pd-code-list">
              {codeLocations.map((loc) => (
                <li key={loc.id}>
                  <code>{loc.code}</code>
                  <span>{loc.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="pd-nav">
        <div className="wrap pd-nav-row">
          <Link to={`/projects/${prev.slug}`} className="pd-nav-link">
            <span className="pd-nav-label">← previous</span>
            <span className="pd-nav-name">{prev.name}</span>
          </Link>
          <Link to={`/projects/${next.slug}`} className="pd-nav-link right">
            <span className="pd-nav-label">next →</span>
            <span className="pd-nav-name">{next.name}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
