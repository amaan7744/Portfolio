import { useState } from "react";
import { profile } from "../data/content";
import Seo from "../components/Seo";
import { breadcrumbSchema } from "../lib/schema";
import "./Contact.css";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [copied, setCopied] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch {
      // No backend running (e.g. static hosting) — fall back to opening a mail client
      // with the message pre-filled, so the form still works end to end.
      const subject = encodeURIComponent(`Portfolio contact from ${form.name || "a visitor"}`);
      const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus("idle");
    }
  }

  function copyEmail() {
    navigator.clipboard.writeText(profile.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="page-enter">
      <Seo
        title="Contact"
        description="Get in touch with Aman Mulani — open to backend, automation, and AI-integration roles, full-time or internship."
        path="/contact"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])}
      />
      <section className="contact-hero">
        <div className="wrap">
          <span className="section-tag">contact</span>
          <h1 className="section-title" style={{ fontSize: "clamp(28px, 4.5vw, 44px)" }}>
            Let's build something that runs itself.
          </h1>
          <p className="section-desc">{profile.status}. Send a message directly, or reach out on email / LinkedIn / GitHub.</p>
        </div>
      </section>

      <section>
        <div className="wrap contact-grid">
          <form className="contact-form" onSubmit={onSubmit}>
            <label>
              Name
              <input required value={form.name} onChange={update("name")} placeholder="Your name" />
            </label>
            <label>
              Email
              <input required type="email" value={form.email} onChange={update("email")} placeholder="you@company.com" />
            </label>
            <label>
              Message
              <textarea required rows={5} value={form.message} onChange={update("message")} placeholder="What are you building?" />
            </label>
            <button className="btn-primary" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message"}
            </button>
            {status === "sent" && <p className="form-note">Thanks — I'll get back to you shortly.</p>}
          </form>

          <div className="contact-side">
            <div className="about-card">
              <div className="row"><span>email</span><span>{profile.email}</span></div>
              <div className="row"><span>phone</span><span>{profile.phone}</span></div>
              <div className="row"><span>location</span><span>{profile.location}</span></div>
              <div className="row"><span>status</span><span>open to roles</span></div>
            </div>
            <div className="contact-links">
              <button className="btn-secondary" onClick={copyEmail}>{copied ? "Copied ✓" : "Copy email"}</button>
              <a className="btn-secondary" href="/Aman_Mulani_Resume.pdf" download>↓ Download résumé</a>
              <a className="btn-secondary" href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
              <a className="btn-secondary" href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
