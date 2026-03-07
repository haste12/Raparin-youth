'use client';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

export default function AboutSection() {
  const { t, isRTL } = useLanguage();
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const animated = entry.target.querySelectorAll('.about-animate');
            animated.forEach((el, i) => {
              setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) translateX(0)';
              }, i * 120);
            });
          }
        });
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);


  return (
    <section id="about" className="about-section" ref={sectionRef}>
      <div className="container">
        <div className="about-grid" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Image side */}
          <div className="about-image-wrapper about-animate" style={{
            opacity: 0,
            transform: 'translateX(-40px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}>
            <div className="about-image-card">
              <img src="/logo.png" alt="Raparin Youth Organization" />

              {/* Float badge 1 */}
              <div className="about-float-badge about-float-badge-1">
                <span className="about-float-badge-icon">🎯</span>
                <div className="about-float-badge-text">
                  <strong>500+</strong>
                  <span>{isRTL ? 'ئەندام چالاک' : 'Active Members'}</span>
                </div>
              </div>

              {/* Float badge 2 */}
              <div className="about-float-badge about-float-badge-2">
                <span className="about-float-badge-icon">⭐</span>
                <div className="about-float-badge-text">
                  <strong>{isRTL ? 'دامەزراوە ٢٠٢٢' : 'Est. 2022'}</strong>
                  <span>{isRTL ? 'ڕاپەڕین' : 'Raparin'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="about-content">
            <div className="about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              <span className="section-tag">{t.about.tag}</span>
              <h2 className="section-title" style={{ textAlign: isRTL ? 'right' : 'left', marginBottom: '20px' }}>
                {t.about.title}
              </h2>
            </div>

            <p className="about-text about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              {t.about.text1}
            </p>

            <h3 className="about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
              textAlign: isRTL ? 'right' : 'left',
              marginTop: '30px',
              marginBottom: '10px',
              fontSize: '22px',
              color: 'var(--color-heading)'
            }}>
              {t.about.subtitle}
            </h3>

            <p className="about-text about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              {t.about.text2}
            </p>

            <p className="about-text about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              {t.about.text3}
            </p>

            <p className="about-text about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              {t.about.text4}
            </p>

            <p className="about-text about-animate" style={{
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}>
              {t.about.text5}
            </p>


          </div>
        </div>
      </div>
    </section>
  );
}
