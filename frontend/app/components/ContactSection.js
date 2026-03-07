'use client';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

export default function ContactSection() {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const animated = entry.target.querySelectorAll('.contact-animate');
            animated.forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Only Location, Email, Phone (NO working hours)
  const contactDetails = [
    { icon: '📍', ...t.contact.details.location },
    { icon: '✉️', ...t.contact.details.email },
    { icon: '📞', ...t.contact.details.phone },
  ];

  const socialLinks = [
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/GanjaneRaparin',
      color: '#1877F2',
      bg: 'rgba(24,119,242,0.12)',
      border: 'rgba(24,119,242,0.3)',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/rekxrawy_ganjani_raparin/',
      color: '#E1306C',
      bg: 'rgba(225,48,108,0.12)',
      border: 'rgba(225,48,108,0.3)',
      svg: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@rekxrawi_ganjani_raparin',
      color: '#FFFFFF',
      bg: '#000000',
      border: 'rgba(255,255,255,0.2)',
      svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
    },
  ];

  return (
    <section id="contact" className="contact-section" ref={sectionRef}>
      {/* Background glow */}
      <div style={{ position:'absolute', top:'10%', right:'-10%', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(107,91,229,0.15) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'5%', left:'-5%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(51,170,255,0.1) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />

      <div className="container">
        {/* Header */}
        <div className="section-header contact-animate" style={{ opacity:0, transform:'translateY(20px)', transition:'opacity 0.7s ease,transform 0.7s ease' }}>
          <span className="section-tag">{t.contact.tag}</span>
          <h2 className="section-title">{t.contact.title}</h2>
          <p className="section-description">{t.contact.description}</p>
        </div>

        {/* 3-col Info Cards */}
        <div className="contact-animate" style={{
          opacity:0, transform:'translateY(20px)',
          transition:'opacity 0.7s ease 0.15s,transform 0.7s ease 0.15s',
          display:'grid',
          gridTemplateColumns:'repeat(3,1fr)',
          gap:'20px',
          marginBottom:'48px',
        }} dir={isRTL ? 'rtl' : 'ltr'}>
          {contactDetails.map((item, i) => (
            <div key={i} style={{
              background:'var(--color-surface)',
              border:'1px solid var(--color-surface-b)',
              borderRadius:'20px',
              padding:'28px 24px',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              gap:'12px',
              textAlign:'center',
              boxShadow:'var(--shadow-card)',
              transition:'transform 0.25s ease,box-shadow 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(51,170,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-card)'; }}
            >
              <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'var(--color-detail-icon-bg)', border:'1px solid var(--color-detail-icon-b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px' }}>
                {item.icon}
              </div>
              <div>
                <div className="contact-detail-label">{item.label}</div>
                <div className="contact-detail-value" dir="ltr" style={{ whiteSpace: 'pre-line' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Media Title */}
        <div className="contact-animate" style={{ opacity:0, transform:'translateY(20px)', transition:'opacity 0.7s ease 0.3s,transform 0.7s ease 0.3s', textAlign:'center', marginBottom:'24px' }}>
          <p style={{ fontSize:'13px', fontWeight:'700', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'2px' }}>
            {t.contact.social}
          </p>
        </div>

        {/* Social Links Grid */}
        <div className="contact-animate" style={{
          opacity:0, transform:'translateY(20px)',
          transition:'opacity 0.7s ease 0.4s,transform 0.7s ease 0.4s',
          display:'grid',
          gridTemplateColumns:'repeat(3,1fr)',
          gap:'16px',
          maxWidth:'480px',
          margin:'0 auto',
        }} dir={isRTL ? 'rtl' : 'ltr'}>
          {socialLinks.map((s) => (
            <a
              key={s.label}
              id={`social-${s.label.toLowerCase().replace(/[^a-z]/g,'')}`}
              href={s.href}
              aria-label={s.label}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
                padding:'16px 8px', background:s.bg, border:`1px solid ${s.border}`,
                borderRadius:'16px', color:s.color, textDecoration:'none',
                transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform='translateY(-5px) scale(1.06)';
                e.currentTarget.style.boxShadow=`0 14px 32px ${s.color}35`;
                e.currentTarget.style.borderColor=s.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform='none';
                e.currentTarget.style.boxShadow='none';
                e.currentTarget.style.borderColor=s.border;
              }}
            >
              {s.svg}
              <span style={{ fontSize:'10px', fontWeight:'600', color:'var(--color-text-muted)', letterSpacing:'0.3px', whiteSpace:'nowrap' }}>
                {s.label}
              </span>
            </a>
          ))}
        </div>

        {/* Responsive override */}
        <style>{`
          @media (max-width: 768px) {
            .contact-info-grid { grid-template-columns: 1fr !important; }
            .contact-social-grid { grid-template-columns: repeat(3,1fr) !important; }
          }
          @media (max-width: 540px) {
            .contact-cols { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
