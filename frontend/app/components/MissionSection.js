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
              }, i * 100);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const goals = [
    t.about.values.goal1,
    t.about.values.goal2,
    t.about.values.goal3,
    t.about.values.goal4,
    t.about.values.goal5,
  ];

  const kuNumbers = ['١', '٢', '٣', '٤', '٥'];

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

      <div className="container">
        {/* Header */}
        <div
          className="mission-animate"
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            textAlign: 'center',
            marginBottom: '60px',
          }}
        >
          <span className="section-tag">{isRTL ? 'ئەرکمان' : 'Our Mission'}</span>
          <h2 className="section-title" style={{ color: 'var(--color-text)' }}>
            {isRTL ? 'ئامانجەکانمان' : 'What We Stand For'}
          </h2>
          <p className="section-description">
            {isRTL
              ? 'ئێمە بەرپرسیارێتی خۆمان پێ دەبەین بۆ گەیشتن بە ئامانجەکانی خوارەوە لە خزمەتی گەنجانی ڕاپەڕین'
              : 'We are committed to achieving the following goals in service of the youth of Raparin'}
          </p>
        </div>

        {/* Two-column layout — goals left, big number accent right (Kurdish: reversed) */}
        <div
          className="mission-animate"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            opacity: 0,
            transform: 'translateY(24px)',
            transition: 'opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '60px',
            alignItems: 'center',
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {/* Goal list */}
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {goals.map((goal, i) => (
              <li
                key={i}
                className="mission-animate"
                id={`mission-goal-${i + 1}`}
                style={{
                  opacity: 0,
                  transform: 'translateY(16px)',
                  transition: `opacity 0.5s ease ${0.2 + i * 0.1}s, transform 0.5s ease ${0.2 + i * 0.1}s`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '18px 24px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-surface-b)',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(' + (isRTL ? '4px' : '-4px') + ')';
                  e.currentTarget.style.boxShadow = '0 8px 28px rgba(51,170,255,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(51,170,255,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  e.currentTarget.style.borderColor = 'var(--color-surface-b)';
                }}
              >
                {/* Number */}
                <span style={{
                  fontSize: '15px',
                  fontWeight: 900,
                  color: 'var(--blue-primary)',
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(51,170,255,0.1)',
                  border: '1px solid rgba(51,170,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isRTL ? kuNumbers[i] : i + 1}
                </span>

                {/* Text */}
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  lineHeight: 1.5,
                  textAlign: isRTL ? 'right' : 'left',
                }}>
                  {goal?.title}
                </span>
              </li>
            ))}
          </ol>

          {/* Decorative large calligraphic number accent */}
          <div
            className="mission-animate"
            style={{
              opacity: 0,
              transform: 'translateY(24px)',
              transition: 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{
              fontSize: 'clamp(80px, 12vw, 140px)',
              fontWeight: 900,
              lineHeight: 1,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              opacity: 0.25,
              userSelect: 'none',
              fontFamily: 'serif',
            }}>
              {isRTL ? '٥' : '5'}
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-text-muted)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              {isRTL ? 'ئامانج' : 'Goals'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
