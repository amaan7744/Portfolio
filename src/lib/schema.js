import { profile, site } from "../data/content";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: site.url,
    email: `mailto:${profile.email}`,
    jobTitle: profile.role,
    address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    knowsAbout: ["Python", "Backend Engineering", "REST APIs", "GitHub Actions", "Automation", "React"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    author: { "@type": "Person", name: profile.name },
  };
}

export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: "2026-01-01",
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: personSchema(),
  };
}

export function breadcrumbSchema(items) {
  // items: [{ name, path }]
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function projectSchema(project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.name,
    description: project.tagline,
    url: `${site.url}/projects/${project.slug}`,
    author: { "@type": "Person", name: profile.name },
    keywords: project.stack.join(", "),
    codeRepository: project.github,
  };
}

export function serviceSchema(service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: service.name,
    description: service.blurb,
    url: `${site.url}/services/${service.id}`,
    provider: { "@type": "Person", name: profile.name },
    areaServed: "Worldwide",
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
