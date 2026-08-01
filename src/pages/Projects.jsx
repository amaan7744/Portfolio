import { Link } from "react-router-dom";
import { projects } from "../data/content";
import Seo from "../components/Seo";
import { breadcrumbSchema } from "../lib/schema";
import useSpotlight from "../hooks/useSpotlight";
import "./Projects.css";

export default function Projects() {
  const gridSpotlight = useSpotlight();
  return (
    <div className="page-enter">
      <Seo
        title="Projects"
        description="Engineering case studies from Aman Mulani: an automated media pipeline, a voice synthesis REST API, and a full-stack MERN booking platform."
        path="/projects"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Projects", path: "/projects" }])}
      />
      <section className="page-hero">
        <div className="wrap">
          <span className="section-tag">projects</span>
          <h1 className="section-title" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
            Engineering case studies, not a gallery.
          </h1>
          <p className="section-desc">
            Every project here is real, from my resume and GitHub — problem, architecture, engineering decisions, and what I'd change next time.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap project-grid" ref={gridSpotlight}>
          {projects.map((p) => (
            <Link className="project-card spotlight" to={`/projects/${p.slug}`} key={p.slug}>
              <div className="project-card-type">{p.type}</div>
              <h2>{p.name}</h2>
              <p>{p.tagline}</p>
              <div className="project-card-stack">
                {p.stack.map((s) => <span className="tag" key={s}>{s}</span>)}
              </div>
              <span className="project-card-cta">Read case study →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
