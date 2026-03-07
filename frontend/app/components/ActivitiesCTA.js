'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import Link from 'next/link';

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!start || target === 0) return;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, start]);

  return value;
}

// ─── Individual animated stat card ───────────────────────────────────────────
function StatCard({ target, suffix = '', label, started, duration }) {
  const count = useCountUp(target, duration, started);
  return (
    <div className="acta-stat-card">
      <div className="acta-stat-number">
        {count}{suffix}
      </div>
      <div className="acta-stat-label">{label}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ActivitiesCTA() {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activityCount, setActivityCount] = useState(null); // null = loading

  // Fetch the real activity count from the API
  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then((data) => {
        const count = Array.isArray(data) ? data.length : 0;
        setActivityCount(count);
      })
      .catch(() => setActivityCount(0));
  }, []);

  // Trigger count-up when the section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger-animate child elements
            entry.target.querySelectorAll('.acta-animate').forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) scale(1)';
              }, i * 120);
            });
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      target: activityCount ?? 0,
      suffix: activityCount !== null && activityCount > 0 ? '+' : '',
      labelEn: 'Activities',
      labelKu: 'چالاکی',
      duration: 1000,
    },
    {
      target: 2022,
      suffix: '',
      labelEn: 'Established',
      labelKu: 'دامەزراوە',
      duration: 1800,
    },
  ];

  return (
    <section id="activities" className="acta-section" ref={sectionRef}>
      {/* Decorative orbs */}
      <div className="acta-orb acta-orb-1" />
      <div className="acta-orb acta-orb-2" />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        {/* Section Header */}
        <div
          className="section-header acta-animate"
          style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
        >
          <span className="section-tag">{t.activities.tag}</span>
          <h2 className="section-title" style={{ color: 'var(--color-text)' }}>{t.activities.title}</h2>
          <p className="section-description">{t.activities.description}</p>
        </div>

        {/* Stats Row — dynamic count-up */}
        <div
          className="acta-animate acta-stats-row"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            opacity: 0, transform: 'translateY(24px)',
            transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
          }}
        >
          {stats.map((s, i) => (
            <StatCard
              key={i}
              target={s.target}
              suffix={s.suffix}
              label={isRTL ? s.labelKu : s.labelEn}
              started={visible && (s.target > 0 || s.target === 2022)}
              duration={s.duration}
            />
          ))}
        </div>

        {/* CTA Block */}
        <div
          className="acta-animate acta-cta-block"
          dir={isRTL ? 'rtl' : 'ltr'}
          style={{
            opacity: 0, transform: 'translateY(24px)',
            transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p className="acta-cta-eyebrow">
              {isRTL
                ? `${activityCount ?? '...'} چالاکی تا ئێستا`
                : `${activityCount ?? '...'} Activities & Counting`}
            </p>
            <p className="acta-cta-headline">
              {isRTL
                ? 'هەموو چالاکییەکانمان، وۆرکشۆپەکان، و بەرنامەکانمان لە یەک شوێن دا ببینە'
                : 'Explore all our events, workshops, and programs in one place'}
            </p>
          </div>

          <Link
            href="/activities"
            id="see-activities-btn"
            className="acta-cta-btn"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 35px rgba(51,170,255,0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(51,170,255,0.4)';
            }}
          >
            <span>{isRTL ? 'چالاکییەکانمان ببینە' : 'See Our Activities'}</span>
            <span style={{ fontSize: '18px' }}>{isRTL ? '←' : '→'}</span>
          </Link>
        </div>
      </div>

      <style>{`
        .acta-section {
          padding: 100px 0;
          background: var(--color-section-act);
          position: relative;
          overflow: hidden;
          transition: background 0.3s ease;
        }
        .acta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.12;
          pointer-events: none;
        }
        .acta-orb-1 {
          width: 500px; height: 500px;
          top: -100px; right: -100px;
          background: radial-gradient(circle, #33AAFF 0%, transparent 70%);
          animation: orbFloat1 10s ease-in-out infinite;
        }
        .acta-orb-2 {
          width: 400px; height: 400px;
          bottom: -80px; left: -80px;
          background: radial-gradient(circle, #6B5BE5 0%, transparent 70%);
          animation: orbFloat2 12s ease-in-out infinite;
        }

        /* Stats row */
        .acta-stats-row {
          display: flex;
          justify-content: center;
          gap: 28px;
          margin-bottom: 52px;
          flex-wrap: wrap;
        }
        .acta-stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-surface-b);
          border-radius: 20px;
          padding: 28px 44px;
          text-align: center;
          box-shadow: var(--shadow-card);
          min-width: 150px;
          flex: 1 1 150px;
          max-width: 220px;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .acta-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(51,170,255,0.18);
        }
        .acta-stat-number {
          font-size: 40px;
          font-weight: 900;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
          /* Prevent width jumping during count-up */
          min-width: 80px;
          display: inline-block;
        }
        .acta-stat-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-muted);
          letter-spacing: 0.3px;
        }

        /* CTA block */
        .acta-cta-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          background: var(--color-surface);
          border: 1px solid var(--color-surface-b);
          border-radius: 24px;
          padding: 36px 44px;
          box-shadow: var(--shadow-card);
        }
        .acta-cta-eyebrow {
          font-size: 13px;
          font-weight: 700;
          color: var(--blue-light);
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .acta-cta-headline {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text);
          line-height: 1.4;
          max-width: 500px;
        }
        .acta-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 16px 36px;
          background: var(--gradient-primary);
          color: #fff;
          border-radius: 9999px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          box-shadow: 0 4px 20px rgba(51,170,255,0.4);
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }

        @media (max-width: 640px) {
          .acta-section { padding: 64px 0; }
          .acta-cta-block { flex-direction: column !important; align-items: stretch !important; }
          .acta-stat-card { padding: 22px 28px; }
          .acta-stat-number { font-size: 32px; }
        }
      `}</style>
    </section>
  );
}
