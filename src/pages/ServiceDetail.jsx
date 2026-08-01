import { Link, useParams, Navigate } from "react-router-dom";
import { services, projects, profile } from "../data/content";
import Seo from "../components/Seo";
import ServiceFlowDiagram from "../components/ServiceFlowDiagram";
import { breadcrumbSchema, serviceSchema, faqSchema } from "../lib/schema";
import "./ServiceDetail.css";

function Block({ title, children }) {
  if (!children) return null;
  return (
    <div className="svd-block">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export default function ServiceDetail() {
  const { id } = useParams();
  const service = services.find((s) => s.id === id);

  if (!service) return <Navigate to="/services" replace />;

  const relatedProjects = (service.relatedProjectSlugs || [])
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter(Boolean);

  // Suggested follow-ups: other services sharing at least one technology,
  // falling back to the next few in catalog order if nothing overlaps.
  const followUps = services
    .filter((s) => s.id !== service.id)
    .filter((s) => s.technologies.some((t) => service.technologies.includes(t)))
    .slice(0, 3);
  const suggested = followUps.length ? followUps : services.filter((s) => s.id !== service.id).slice(0, 3);

  return (
    <div className="page-enter">
      <Seo
        title={service.name}
        description={service.blurb}
        path={`/services/${service.id}`}
        jsonLd={[
          serviceSchema(service),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.id}` },
          ]),
          ...(service.faqs?.length ? [faqSchema(service.faqs)] : []),
        ]}
      />

      <section className="svd-hero">
        <div className="wrap">
          <Link to="/services" className="pd-back">← all services</Link>
          <span className="section-tag">service</span>
          <h1 className="pd-title">{service.name}</h1>
          <p className="pd-tagline">{service.blurb}</p>
          <div className="hero-tags" style={{ marginTop: 22 }}>
            {service.technologies.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
          <div className="pd-links">
            <Link to="/contact" className="btn-primary">Discuss this service →</Link>
          </div>
        </div>
      </section>

      {service.architecture?.length > 0 && (
        <section className="svd-diagram">
          <div className="wrap">
            <div className="section-tag">example architecture</div>
            <ServiceFlowDiagram steps={service.architecture} />
          </div>
        </section>
      )}

      <section className="svd-body">
        <div className="wrap pd-grid">
          <Block title="The problem">
            <p>{service.problem}</p>
          </Block>
          <Block title="Who it's for">
            <p>{service.idealClient}</p>
          </Block>
          <Block title="Business value">
            <ul>{service.businessValue.map((v, i) => <li key={i}>{v}</li>)}</ul>
          </Block>
          <Block title="Deliverables">
            <ul>{service.deliverables.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </Block>
          <Block title="Development workflow">
            <ol className="svd-ol">{service.process.map((p, i) => <li key={i}>{p}</li>)}</ol>
          </Block>
          <Block title="Timeline">
            <p>{service.timeline}</p>
          </Block>
        </div>
      </section>

      {service.faqs?.length > 0 && (
        <section className="svd-faqs">
          <div className="wrap">
            <h2 className="svd-h2">Frequently asked questions</h2>
            <div className="svd-faq-list">
              {service.faqs.map((f, i) => (
                <details className="svd-faq" key={i}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="svd-related">
          <div className="wrap">
            <h2 className="svd-h2">Related case studies</h2>
            <div className="svd-related-grid">
              {relatedProjects.map((p) => (
                <Link to={`/projects/${p.slug}`} key={p.slug} className="svd-related-card">
                  <h3>{p.name}</h3>
                  <p>{p.tagline}</p>
                  <span className="svd-related-link">View case study →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="svd-related">
        <div className="wrap">
          <h2 className="svd-h2">Suggested follow-up services</h2>
          <div className="svd-follow-grid">
            {suggested.map((s) => (
              <Link to={`/services/${s.id}`} key={s.id} className="svd-follow-chip">
                {s.name} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="services-cta">
        <div className="wrap services-cta-inner">
          <h2>Think this is a fit?</h2>
          <p>Describe what you're building and {profile.name.split(" ")[0]} will tell you plainly whether it is.</p>
          <Link to="/contact" className="btn-primary">Get in touch →</Link>
        </div>
      </section>
    </div>
  );
}
