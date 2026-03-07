'use client';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

export default function MissionSection() {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.mission-animate').forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 150);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="mission"
      ref={sectionRef}
      style={{
        padding: '100px 0',
        background: 'var(--color-section-about)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-80px', left: isRTL ? 'auto' : '-80px', right: isRTL ? '-80px' : 'auto', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(51,170,255,0.08) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', right: isRTL ? 'auto' : '-60px', left: isRTL ? '-60px' : 'auto', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(107,91,229,0.08) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div className="container" dir={isRTL ? 'rtl' : 'ltr'}>
        
        {/* Mission Section */}
        <div className="mission-animate" style={{ marginBottom: '100px', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <div style={{ textAlign: isRTL ? 'right' : 'left', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: isRTL ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: '36px' }}>🎯</span> {t.about.mission.title}
            </h2>
            <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: '40px' }}>
              {t.about.mission.desc}
            </p>
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-heading)', marginBottom: '24px' }}>
              {t.about.mission.pointsTitle}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {t.about.mission.points.map((point, index) => {
                const kuNumbers = ['١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠'];
                return (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  alignItems: 'flex-start',
                  background: 'var(--color-surface)',
                  padding: '24px',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--color-surface-b)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--blue-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-surface-b)';
                }}
                >
                  <div style={{
                    minWidth: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(51,170,255,0.1)',
                    color: 'var(--blue-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    {isRTL ? kuNumbers[index] || index + 1 : index + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text)' }}>{point}</p>
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="mission-animate" style={{ marginBottom: '80px', opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>👁️</span>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '24px' }}>
              {t.about.vision.title}
            </h2>
            <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: '16px' }}>
              {t.about.vision.desc1}
            </p>
            <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: '16px' }}>
              {t.about.vision.desc2}
            </p>
            <h3 style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '16px', fontWeight: 700, color: 'var(--blue-primary)' }}>
              {t.about.vision.desc3}
            </h3>
          </div>
        </div>

        {/* Values Section */}
        <div className="mission-animate" style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-heading)', marginBottom: '12px' }}>
              {t.about.guidingValues.title}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text)', maxWidth: '600px', margin: '0 auto' }}>
              {t.about.guidingValues.desc}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {t.about.guidingValues.points.map((val, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-surface-b)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(51,170,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(51,170,255,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  e.currentTarget.style.borderColor = 'var(--color-surface-b)';
                }}
              >
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue-light)', marginBottom: '12px' }}>
                  {val.title}
                </h4>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text)', margin: 0 }}>
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
