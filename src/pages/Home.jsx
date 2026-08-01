import { Link } from "react-router-dom";
import { profile, projects, skills } from "../data/content";
import PipelineDiagram from "../components/PipelineDiagram";
import SystemStatus from "../components/SystemStatus";
import GithubPanel from "../components/GithubPanel";
import GithubActivity from "../components/GithubActivity";
import Seo from "../components/Seo";
import { personSchema, websiteSchema } from "../lib/schema";
import useReveal from "../hooks/useReveal";
import useSpotlight from "../hooks/useSpotlight";
import useMagnetic from "../hooks/useMagnetic";
import "./Home.css";

export default function Home() {
  const aboutRef = useReveal();
  const expertiseRef = useReveal();
  const projectsRef = useReveal();
  const githubRef = useReveal();
  const aboutSpotlight = useSpotlight();
  const expertiseSpotlight = useSpotlight();
  const projectsSpotlight = useSpotlight();
  const primaryCtaRef = useMagnetic(0.25);
  const githubCtaRef = useMagnetic(0.25);
  const linkedinCtaRef = useMagnetic(0.25);

  return (
    <div className="page-enter" id="top">
      <Seo
        title="Python Backend & Automation Engineer"
        description={profile.summary}
        path="/"
        jsonLd={[personSchema(), websiteSchema()]}
      />
      <section className="hero">
        <div className="wrap">
          <div className="eyebrow reveal in">
            <span className="dot" />
            {profile.status}
          </div>
          <h1 className="headline">
            I build backend systems that <span className="accent">run themselves.</span>
          </h1>
          <p className="sub">{profile.summary}</p>

          <div className="hero-tags">
            {["Python", "Flask", "Node.js / Express", "React.js", "MongoDB", "GitHub Actions CI/CD", "OpenAI API", "Docker"].map((t) => (
              <span className="tag" key={t}>{t}</span>
            ))}
          </div>

          <div className="hero-cta">
            <Link ref={primaryCtaRef} className="btn-primary" to="/projects">View case studies →</Link>
            <a ref={githubCtaRef} className="btn-secondary" href={profile.github} target="_blank" rel="noopener noreferrer">github.com/{profile.githubUser}</a>
            <a ref={linkedinCtaRef} className="btn-secondary" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>

          <div className="stat-row">
            <div className="stat"><div className="num">{projects.length}</div><div className="label">featured case studies</div></div>
            <div className="stat"><div className="num">800+</div><div className="label">commits on one pipeline</div></div>
            <div className="stat"><div className="num">2</div><div className="label">internships completed</div></div>
            <div className="stat"><div className="num">daily</div><div className="label">cron-scheduled runs</div></div>
          </div>

          <SystemStatus />

          <PipelineDiagram />
        </div>
      </section>

      <section id="about">
        <div className="wrap">
          <div className="section-head reveal" ref={aboutRef}>
            <span className="section-tag">01 / about</span>
            <h2 className="section-title">Comfortable across the stack, focused on backend.</h2>
          </div>
          <div className="about-grid" ref={aboutSpotlight}>
            <div className="about-text">
              <p>I'm <strong>{profile.name}</strong>, a Python-focused software engineer based in {profile.location}. My work centers on <strong>API-driven backend systems and automation</strong> — services and pipelines built to run without someone babysitting them.</p>
              <p>My most substantial project chains speech recognition, voice synthesis, and video processing into a single headless workflow, deployed with GitHub Actions cron jobs and refined over <strong>800+ commits</strong>.</p>
              <p>I'm also comfortable end-to-end — React on the frontend, Node.js/Express and Flask on the backend, MongoDB for storage. Right now I'm narrowing in on backend engineering, automation, and applied AI integration.</p>
            </div>
            <div className="about-card spotlight">
              <div className="row"><span>location</span><span>{profile.location}</span></div>
              <div className="row"><span>focus</span><span>backend · automation · AI integration</span></div>
              <div className="row"><span>languages</span><span>{skills.languages.join(", ")}</span></div>
              <div className="row"><span>currently</span><span>open to full-time / internship roles</span></div>
              <div className="row"><span>email</span><span>{profile.email}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="expertise">
        <div className="wrap">
          <div className="section-head reveal" ref={expertiseRef}>
            <span className="section-tag">02 / core expertise</span>
            <h2 className="section-title">Where I spend most of my time.</h2>
          </div>
          <div className="expertise-grid" ref={expertiseSpotlight}>
            <div className="expertise-card spotlight">
              <h3>Backend &amp; APIs</h3>
              <p>Designing and shipping REST APIs with Flask, Node.js, and Express — integrating third-party services like the YouTube Data API v3 and the OpenAI API into working systems.</p>
            </div>
            <div className="expertise-card spotlight">
              <h3>Automation &amp; CI/CD</h3>
              <p>Building scheduled, headless workflows with GitHub Actions — cron-triggered pipelines that install dependencies, run end-to-end, and persist state back to the repo on their own.</p>
            </div>
            <div className="expertise-card spotlight">
              <h3>Applied AI Integration</h3>
              <p>Chaining ML models — OpenAI Whisper for transcription, Coqui XTTS-v2 for voice synthesis — into automated workflows, not just calling an API once.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured-projects">
        <div className="wrap">
          <div className="section-head reveal" ref={projectsRef}>
            <span className="section-tag">03 / featured work</span>
            <h2 className="section-title">Case studies, not cards.</h2>
            <p className="section-desc">Every project below is a full engineering write-up — problem, architecture, decisions, tradeoffs.</p>
          </div>
          <div className="home-project-list" ref={projectsSpotlight}>
            {projects.map((p) => (
              <Link className="home-project spotlight" key={p.slug} to={`/projects/${p.slug}`}>
                <div>
                  <div className="home-project-name">{p.name}</div>
                  <div className="home-project-tagline">{p.tagline}</div>
                  <div className="hero-tags" style={{ marginTop: 14 }}>
                    {p.stack.slice(0, 4).map((s) => <span className="tag" key={s}>{s}</span>)}
                  </div>
                </div>
                <span className="home-project-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="github">
        <div className="wrap">
          <div className="section-head reveal" ref={githubRef}>
            <span className="section-tag">04 / github activity</span>
            <h2 className="section-title">Live from github.com/{profile.githubUser}</h2>
            <p className="section-desc">Fetched directly from the GitHub REST API on page load — not a static screenshot.</p>
          </div>
          <GithubPanel />
          <GithubActivity />
        </div>
      </section>
    </div>
  );
}
