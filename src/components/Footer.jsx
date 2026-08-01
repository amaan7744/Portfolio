import { profile } from "../data/content";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>© 2026 {profile.name}. Built with React, custom CSS, and a lot of JetBrains Mono.</p>
        <div className="footer-links">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href="#top">back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
