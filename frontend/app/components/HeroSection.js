'use client';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

export default function HeroSection() {
  const { t, isRTL } = useLanguage();
  const heroRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // Animate particles
    const container = document.getElementById('hero-particles');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.6 + 0.1};
        background: ${Math.random() > 0.5 ? '#33AAFF' : '#6B5BE5'};
        animation: particleFloat${i % 3} ${4 + Math.random() * 6}s ease-in-out infinite;
        animation-delay: ${Math.random() * -8}s;
      `;
      container.appendChild(p);
    }

    // Intersection observer for entrance animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      },
      { threshold: 0.1 }
    );

    const animated = heroRef.current?.querySelectorAll('.hero-animate');
    animated?.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.7s ease ${i * 0.12}s, transform 0.7s ease ${i * 0.12}s`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToActivities = () => {
    document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const stats = [
    { number: '3', label: t.hero.stats.years },
  ];

  return (
    <section id="home" className="hero" ref={heroRef}>
      {/* Background */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-grid" />
        <div className="hero-particles" id="hero-particles" />
      </div>

      {/* Content */}
      <div className="hero-content">
        <div className="container">
          <div className="hero-inner" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Text */}
            <div className="hero-text">
              <div className="hero-badge hero-animate">
                <span className="hero-badge-dot" />
                {t.hero.badge}
              </div>

              <h1 className="hero-title hero-animate">
                {t.hero.title}{' '}
                <span className="gradient-text">{t.hero.titleHighlight}</span>
                <br />
                {t.hero.titleEnd}
              </h1>


              <div className="hero-cta hero-animate">
                <button id="hero-cta-primary" className="btn-primary" onClick={scrollToActivities}>
                  <span>{t.hero.ctaPrimary}</span>
                  <span style={{ fontSize: '16px' }}>→</span>
                </button>
                <button id="hero-cta-secondary" className="btn-outline" onClick={scrollToContact}>
                  {t.hero.ctaSecondary}
                </button>
              </div>

              <div className="hero-stats hero-animate">
                {stats.map((stat, i) => (
                  <div className="hero-stat" key={i}>
                    <span className="hero-stat-number">{stat.number}</span>
                    <span className="hero-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="hero-visual hero-animate">
              <div className="hero-logo-ring">
                <div className="hero-logo-ring-outer" />
                <img
                  id="hero-logo"
                  src="/logo.png"
                  alt="Raparin Youth Organization Logo"
                  className="hero-logo-img"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        opacity: 0.5,
        animation: 'bounce 2s ease-in-out infinite',
      }}>
        <span style={{ fontSize: '12px', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Scroll</span>
        <div style={{
          width: '24px',
          height: '40px',
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '6px',
        }}>
          <div style={{
            width: '4px',
            height: '8px',
            background: 'white',
            borderRadius: '2px',
            animation: 'scrollDot 1.5s ease-in-out infinite',
          }} />
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        @keyframes particleFloat0 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes particleFloat1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(15px) translateX(-15px); }
        }
        @keyframes particleFloat2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-10px) translateX(20px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
      `}</style>
    </section>
  );
}
