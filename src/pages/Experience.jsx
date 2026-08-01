import { experience, education, skills } from "../data/content";
import Seo from "../components/Seo";
import { breadcrumbSchema } from "../lib/schema";
import "./Experience.css";

export default function Experience() {
  return (
    <div className="page-enter">
      <Seo
        title="Experience"
        description="Work history, education, and technical skills for Aman Mulani — Python backend and automation engineer."
        path="/experience"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Experience", path: "/experience" }])}
      />
      <section className="page-hero">
        <div className="wrap">
          <span className="section-tag">experience</span>
          <h1 className="section-title" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Where I've worked, and what I know.</h1>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="timeline">
            {experience.map((e) => (
              <div className="tl-item" key={e.role + e.org}>
                <div className="tl-role">{e.role} — {e.org}</div>
                <div className="tl-meta">{e.location} · {e.period}</div>
                <ul className="tl-desc">
                  {e.points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="section-tag">education</span>
            <h2 className="section-title">Academic background.</h2>
          </div>
          <div className="edu-card">
            <div>
              <h3>{education.degree}</h3>
              <p>{education.school}</p>
            </div>
            <span className="edu-status">{education.status}</span>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <span className="section-tag">skills</span>
            <h2 className="section-title">The stack, as a manifest.</h2>
          </div>
          <div className="manifest">
            <div className="manifest-bar"><span className="dots"><span></span><span></span><span></span></span>skills.json</div>
            <div className="manifest-body">
              {Object.entries({
                languages: skills.languages,
                backend_and_apis: skills.backend,
                frontend: skills.frontend,
                ai_and_automation: skills.aiAutomation,
                databases: skills.databases,
                devops_and_tools: skills.devops,
              }).map(([key, values]) => (
                <div className="skill-group" key={key}>
                  <span className="skill-key">"{key}"</span>: {" "}
                  <span className="skill-val">
                    {values.map((v, i) => (
                      <span className="item" key={v}>{v}{i < values.length - 1 ? ", " : ""}</span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
