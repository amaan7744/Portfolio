import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import CursorGlow from "./components/CursorGlow";
import { ScrollProgress, BackToTop } from "./components/ScrollUtils";
import AssistantWidget from "./assistant/AssistantWidget";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Dashboard from "./pages/Dashboard";
import Experience from "./pages/Experience";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="grid-bg" />
      <CursorGlow />
      <ScrollProgress />
      <Nav onOpenPalette={openPalette} />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
      <CommandPalette open={paletteOpen} onClose={closePalette} />
      <AssistantWidget />
    </>
  );
}
