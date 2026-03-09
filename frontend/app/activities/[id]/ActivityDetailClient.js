'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../LanguageContext';
import { useActivityTranslation } from '../../hooks/useActivityTranslation';

const KU_MONTHS = [
  'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران',
  'تەممووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم',
];

function formatDate(dateStr, lang) {
  const date = new Date(dateStr);
  if (lang === 'ku') {
    return `${date.getDate()}ی ${KU_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }
  if (lang === 'ar') {
    return date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '20px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Close"
      >×</button>
      <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '10px', objectFit: 'contain' }} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default function ActivityDetailClient({ activity }) {
  const { lang, isRTL, t } = useLanguage();
  const [lightbox, setLightbox] = useState(null);

  const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1px)' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  );

  const ExpandIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"></polyline>
      <polyline points="9 21 3 21 3 15"></polyline>
      <line x1="21" y1="3" x2="14" y2="10"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    </svg>
  );

  // Wrap single activity in array for the shared translation hook
  const { translatedActivities } = useActivityTranslation([activity]);
  const translated = translatedActivities[0];

  const title = lang === 'ku'
    ? (translated.titleKu || translated.titleEn)
    : lang === 'ar'
    ? translated.titleAr
    : translated.titleEn;
  const content = lang === 'ku'
    ? (translated.contentKu || translated.contentEn)
    : lang === 'ar'
    ? translated.contentAr
    : translated.contentEn;
  const allImages = [
    ...(activity.coverImage ? [activity.coverImage] : []),
    ...(activity.images || []),
  ].filter(Boolean);

  return (
    <>
      {/* Hero */}
      <div className="detail-hero">
        {activity.coverImage && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img src={activity.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,22,40,0.6) 0%, rgba(10,22,40,1) 100%)' }} />
          </div>
        )}
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
            <Link href="/" style={{ color: '#33AAFF', textDecoration: 'none' }}>{t.nav.home}</Link>
            <span>{isRTL ? '←' : '→'}</span>
            <Link href="/activities" style={{ color: '#33AAFF', textDecoration: 'none' }}>{t.nav.activities}</Link>
            <span>{isRTL ? '←' : '→'}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{title}</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(51,170,255,0.15)', border: '1px solid rgba(51,170,255,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', color: '#33AAFF', marginBottom: '18px' }}>
            <CalendarIcon /> {formatDate(activity.date, lang)}
          </div>

          <h1 dir={isRTL ? 'rtl' : 'ltr'} style={{ color: '#fff', fontSize: 'clamp(26px, 4vw, 52px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px', textAlign: isRTL ? 'right' : 'left' }}>
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <section style={{ background: 'var(--color-section-act)', padding: '60px 0 100px', overflowX: 'hidden' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Cover Image */}
            {activity.coverImage && (
              <div style={{ marginBottom: '40px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setLightbox(activity.coverImage)}>
                <img src={activity.coverImage} alt={title} style={{ width: '100%', maxHeight: '480px', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Article Content */}
            {content && (
              content.includes('<') ? (
                <div
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="article-html"
                  style={{ color: 'var(--color-text)', fontSize: '17px', lineHeight: 1.85, marginBottom: '48px', textAlign: isRTL ? 'right' : 'left', wordBreak: 'break-word', overflowWrap: 'break-word', overflowX: 'hidden', fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : lang === 'ku' ? "'Rabar_019',sans-serif" : 'inherit' }}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <div dir={isRTL ? 'rtl' : 'ltr'} style={{ color: 'var(--color-text)', fontSize: '17px', lineHeight: 1.85, marginBottom: '48px', textAlign: isRTL ? 'right' : 'left', wordBreak: 'break-word', overflowWrap: 'break-word', overflowX: 'hidden', fontFamily: lang === 'ar' ? "'Cairo',sans-serif" : lang === 'ku' ? "'Rabar_019',sans-serif" : 'inherit' }}>
                  {content.split(/\n\n+/).map((block, i) => {
                    const trimmed = block.trim();
                    if (!trimmed) return null;
                    return <p key={i} style={{ margin: '0 0 24px', whiteSpace: 'pre-wrap' }}>{trimmed}</p>;
                  })}
                </div>
              )
            )}

            {/* Gallery */}
            {(activity.images || []).length > 0 && (
              <div style={{ marginTop: '48px' }}>
                <h2 style={{ color: 'var(--color-text)', fontSize: '22px', fontWeight: 700, marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid rgba(51,170,255,0.2)', textAlign: isRTL ? 'right' : 'left' }} dir={isRTL ? 'rtl' : 'ltr'}>
                  {lang === 'ku' ? 'وێنەکان' : lang === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
                </h2>
                <div className="detail-gallery">
                  {activity.images.map((img, i) => (
                    <div key={i} className="detail-gallery-item" onClick={() => setLightbox(img)}>
                      <img src={img} alt={`${title} – photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }} />
                      <div className="gallery-overlay">
                        <span style={{ color: '#fff' }}><ExpandIcon /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* YouTube Embed */}
            {activity.youtubeUrl && (() => {
              const match = activity.youtubeUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
              const videoId = match?.[1];
              if (!videoId) return null;
              return (
                <div style={{ marginTop: '48px' }}>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '14px', overflow: 'hidden' }}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Back button */}
            <div style={{ marginTop: '56px', textAlign: isRTL ? 'right' : 'left' }} dir={isRTL ? 'rtl' : 'ltr'}>
              <Link href="/activities" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#33AAFF', textDecoration: 'none', fontSize: '15px', fontWeight: 600, padding: '12px 24px', border: '1px solid rgba(51,170,255,0.3)', borderRadius: '10px', background: 'rgba(51,170,255,0.05)', transition: 'background 0.2s' }}>
                {lang === 'ku' ? 'بگەڕێوە بۆ چالاکییەکان ←' : lang === 'ar' ? 'العودة إلى الأنشطة ←' : '← Back to Activities'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      <style>{`
        .article-html { color: var(--color-text); font-style: normal; }
        .article-html *, .article-html p, .article-html span,
        .article-html em, .article-html i, .article-html b, .article-html strong {
          font-style: normal !important;
          font-family: inherit !important;
        }
        html[data-theme="dark"] .article-html,
        html[data-theme="dark"] .article-html * {
          color: #FFFFFF !important;
        }
        .detail-hero {
          min-height: 380px;
          padding: 140px 0 60px;
          background: linear-gradient(135deg, #0A1628 0%, #0D3461 55%, #1A5C9E 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .detail-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }
        .detail-gallery-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          background: var(--color-bg-alt);
        }
        .detail-gallery-item:hover img { transform: scale(1.05); }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          opacity: 0;
        }
        .detail-gallery-item:hover .gallery-overlay { background: rgba(0,0,0,0.35); opacity: 1; }
        .detail-spinner {
          display: inline-block;
          width: 11px;
          height: 11px;
          border: 2px solid rgba(51,170,255,0.3);
          border-top-color: #33AAFF;
          border-radius: 50%;
          animation: detailSpin 0.7s linear infinite;
        }
        @keyframes detailSpin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .detail-gallery { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
