'use client';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useActivityTranslation } from '../hooks/useActivityTranslation';
import Link from 'next/link';

// Kurdish month names
const KU_MONTHS = [
  'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
  'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم',
];

function formatDate(dateStr, lang) {
  const date = new Date(dateStr);
  if (lang === 'ku') {
    return date.getDate() + 'ی ' + KU_MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }
  if (lang === 'ar') {
    return date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Activity Card Image ──────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(2px)', marginRight: '4px', marginLeft: '4px' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

function ActivityImage({ activity }) {
  const [imgError, setImgError] = useState(false);
  // Support both legacy `image` field and new `coverImage` field
  const rawSrc = activity.coverImage || activity.image || null;
  const src = rawSrc
    ? rawSrc.startsWith('/') || rawSrc.startsWith('http')
      ? rawSrc
      : `/activities/${rawSrc}`
    : null;

  if (src && !imgError) {
    return (
      <div className="activity-card-image">
        <img
          src={src}
          alt={activity.titleEn}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      className="activity-card-image"
      style={{
        background: `linear-gradient(135deg, ${activity.color || '#33AAFF'}28, ${activity.color || '#33AAFF'}0a)`,
        borderTop: `3px solid ${activity.color || '#33AAFF'}`,
      }}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// Activities are passed as props from the server component (activities/page.js)
// which reads them from /data/activities.json
export default function ActivitiesPageContent({ activities = [] }) {
  const { t, isRTL, lang } = useLanguage();
  const { translatedActivities } = useActivityTranslation(activities);
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll('.act-card');
    cards?.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 70);
    });
  }, [translatedActivities]);

  return (
    <>
      {/* Page Hero */}
      <div className="act-page-hero">
        <div className="act-page-hero-bg">
          <div className="act-page-orb act-page-orb-1" />
          <div className="act-page-orb act-page-orb-2" />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(51,170,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(51,170,255,0.05) 1px,transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse at center,black 30%,transparent 80%)' }} />
        </div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.55)' }}>
            <Link href="/" style={{ color: 'var(--blue-light)', textDecoration: 'none' }}>
              {t.nav.home}
            </Link>
            <span>{isRTL ? '←' : '→'}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>{t.nav.activities}</span>
          </div>

          <span className="section-tag" style={{ marginBottom: '16px', display: 'inline-block' }}>{t.activities.tag}</span>
          <h1 className="section-title" style={{ fontSize: 'clamp(32px,5vw,60px)', marginBottom: '16px', textAlign: isRTL ? 'right' : 'left', color: '#fff' }}>
            {t.activities.title}
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', maxWidth: '600px', lineHeight: 1.7, textAlign: isRTL ? 'right' : 'left' }}>
            {t.activities.description}
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <section style={{ background: 'var(--color-section-act)', padding: '60px 0 100px', minHeight: '60vh', transition: 'background 0.3s ease' }}>
        <div className="container">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '32px', textAlign: isRTL ? 'right' : 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {lang === 'ku'
              ? `${activities.length} چالاکی`
              : lang === 'ar'
              ? `${activities.length} نشاط`
              : `${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`}
          </p>

          <div className="activities-grid" dir={isRTL ? 'rtl' : 'ltr'} ref={gridRef}>
            {translatedActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="activity-card act-card"
                style={{ transition: 'opacity 0.4s ease, transform 0.4s ease', textDecoration: 'none', display: 'block' }}
              >
                {/* Cover image or colored bar */}
                <ActivityImage activity={activity} />

                <div className="activity-card-body">
                  <div className="activity-card-date">
                    <CalendarIcon />
                    {formatDate(activity.date, lang)}
                  </div>
                  <h2 className="activity-card-title">
                    {lang === 'ku'
                      ? (activity.titleKu || activity.titleEn)
                      : lang === 'ar'
                      ? activity.titleAr
                      : activity.titleEn}
                  </h2>
                  <p className="activity-card-desc">
                    {lang === 'ku'
                      ? (activity.shortDescKu || activity.shortDescEn || activity.descriptionEn)
                      : lang === 'ar'
                      ? (activity.shortDescAr || activity.shortDescKu || activity.descriptionEn)
                      : (activity.shortDescEn || activity.shortDescKu || activity.descriptionEn)}
                  </p>
                </div>

                <div className="activity-card-footer">
                  <span className="activity-read-more">
                    {t.activities.readMore}
                    <span>{isRTL ? '←' : '→'}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .act-page-hero {
          min-height: 340px;
          padding: 140px 0 60px;
          background: linear-gradient(135deg, #0A1628 0%, #0D3461 55%, #1A5C9E 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .act-page-hero-bg { position: absolute; inset: 0; pointer-events: none; }
        .act-page-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.35; }
        .act-page-orb-1 { width:500px; height:500px; top:-150px; right:-80px; background:radial-gradient(circle,#33AAFF 0%,transparent 70%); animation:orbFloat1 8s ease-in-out infinite; }
        .act-page-orb-2 { width:400px; height:400px; bottom:-100px; left:-60px; background:radial-gradient(circle,#6B5BE5 0%,transparent 70%); animation:orbFloat2 10s ease-in-out infinite; }
        .activity-card { cursor: pointer; color: inherit; }
        .translate-spinner {
          display: inline-block;
          width: 10px;
          height: 10px;
          border: 2px solid rgba(51,170,255,0.3);
          border-top-color: #33AAFF;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
