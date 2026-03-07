'use client';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import MissionSection from './components/MissionSection';
import ActivitiesCTA from './components/ActivitiesCTA';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function Home() {
  const [activeSection, setActiveSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const sections = ['home', 'about', 'contact'];
    const options = { rootMargin: '-40% 0px -40% 0px' };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main>
      <Navbar activeSection={activeSection} />

      <HeroSection />

      {/* Divider */}
      <div className="section-divider" />

      <AboutSection />

      {/* Divider */}
      <div className="section-divider" />

      <MissionSection />

      {/* Divider */}
      <div className="section-divider" />

      <ActivitiesCTA />

      {/* Divider */}
      <div className="section-divider" />

      <ContactSection />

      <Footer />

      {/* Scroll to top button */}
      <button
        id="scroll-to-top"
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </main>
  );
}
