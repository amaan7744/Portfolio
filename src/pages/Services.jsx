import { useState } from "react";
import { Link } from "react-router-dom";
import { services, profile } from "../data/content";
import Seo from "../components/Seo";
import { breadcrumbSchema } from "../lib/schema";
import useSpotlight from "../hooks/useSpotlight";
import "./Services.css";

function ServiceCard({ service }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`service-card spotlight${open ? " service-card-open" : ""}`}>
      <button
        type="button"
        className="service-card-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div>
          <h2>{service.name}</h2>
          <p>{service.blurb}</p>
        </div>
        <span className="service-card-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>

      <div className="service-card-tags">
        {service.technologies.map((t) => <span className="tag" key={t}>{t}</span>)}
      </div>

      {open && (
        <div className="service-card-body">
          <div className="service-card-row">
            <h3>Ideal client</h3>
            <p>{service.idealClient}</p>
          </div>
          <div className="service-card-row">
            <h3>Deliverables</h3>
            <ul>{service.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
          <div className="service-card-row">
            <h3>Process</h3>
            <ol>{service.process.map((p, i) => <li key={i}>{p}</li>)}</ol>
          </div>
          <div className="service-card-row">
            <h3>Timeline</h3>
            <p>{service.timeline}</p>
          </div>
          <div className="service-card-actions">
            <Link to={`/services/${service.id}`} className="btn-secondary service-card-cta">
              Full details →
            </Link>
            <Link to="/contact" className="btn-secondary service-card-cta">
              Discuss this →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Services() {
  const gridSpotlight = useSpotlight();

  return (
    <div className="page-enter">
      <Seo
        title="Services"
        description="Twelve services, from custom websites to long-term maintenance — grounded in Aman Mulani's actual engineering skills and shipped work, not a generic agency menu."
        path="/services"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])}
      />

      <section className="page-hero">
        <div className="wrap">
          <span className="section-tag">services</span>
          <h1 className="section-title" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>
            What I actually build, not a generic services list.
          </h1>
          <p className="section-desc">
            Each service below is grounded in real, demonstrated engineering work — most map directly
            to a shipped case study; where one doesn't yet, that's stated plainly rather than implied.
            No fixed pricing, no invented capabilities. {profile.status}.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap service-grid" ref={gridSpotlight}>
          {services.map((s) => <ServiceCard service={s} key={s.id} />)}
        </div>
      </section>

      <section className="services-cta">
        <div className="wrap services-cta-inner">
          <h2>Not sure which of these fits?</h2>
          <p>Describe what you're trying to build and I'll tell you plainly whether it's a fit.</p>
          <Link to="/contact" className="btn-primary">Get in touch →</Link>
        </div>
      </section>
    </div>
  );
}
