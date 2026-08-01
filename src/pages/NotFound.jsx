import { Link } from "react-router-dom";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <div className="page-enter wrap" style={{ padding: "140px 28px", textAlign: "center" }}>
      <Seo title="Page not found" path="/404" noindex />
      <p style={{ fontFamily: "var(--mono)", color: "var(--accent)", marginBottom: 14 }}>404</p>
      <h1 className="section-title" style={{ marginBottom: 20 }}>This route doesn't exist.</h1>
      <Link className="btn-primary" to="/">← back to home</Link>
    </div>
  );
}
