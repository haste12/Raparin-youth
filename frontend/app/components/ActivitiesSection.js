'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

const CATEGORY_ICONS = {
  training: '🎓',
  community: '🤝',
  sports: '⚽',
  culture: '🎭',
  education: '📚',
  health: '💚',
};

export default function ActivitiesSection() {
  const { t, isRTL, lang } = useLanguage();
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch('/api/activities');
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length) {
          setActivities(list);
          setFiltered(list);
        }
      } catch (err) {
        // Fallback mock data if backend not running
        const fallback = [
          { id: 1, titleEn: 'Youth Leadership Training', titleKu: 'پەروەردەی ڕابەرایەتی گەنجان', descriptionEn: 'A comprehensive training program empowering young leaders with skills in communication, teamwork, and civic responsibility.', descriptionKu: 'پرۆگرامێکی تەواوی پەروەردە کە گەنجانی ڕابەر بەهێز دەکات بە شارەزایی لە پەیوەندی، کارتیمی، و بەرپرسیارێتی مەدەنی.', date: '2024-03-15', category: 'training' },
          { id: 2, titleEn: 'Community Clean-Up Campaign', titleKu: 'کەمپەینی پاکیکردنەوەی کۆمەڵگا', descriptionEn: 'Volunteers gathered to clean public spaces and raise awareness about environmental responsibility in Raparin.', descriptionKu: 'خۆبەخشەکان کۆبوونەوە بۆ پاکیکردنەوەی شوێنە گشتییەکان و هۆشیارکردنەوە لەبارەی بەرپرسیارێتی ژینگەیی لە ڕاپەڕین.', date: '2024-04-20', category: 'community' },
          { id: 3, titleEn: 'Sports & Recreation Day', titleKu: 'ڕۆژی وەرزش و ڕاکردن', descriptionEn: 'Annual sports day fostering teamwork, physical health, and community bonding among youth members.', descriptionKu: 'ڕۆژی وەرزشی ساڵانە کە کارتیمی، تەندرووستی جەستەیی، و پەیوەندی کۆمەڵگا لەنێوان ئەندامانی گەنجان زیاد دەکات.', date: '2024-05-10', category: 'sports' },
          { id: 4, titleEn: 'Cultural Heritage Festival', titleKu: 'فێستیڤاڵی میراتی کەلتووری', descriptionEn: 'Celebrating Kurdish culture, music, and traditional arts to preserve our rich heritage for future generations.', descriptionKu: 'پیرۆزکردنی کەلتووری کوردی، موزیک، و هونەری نەریتی بۆ پاراستنی میراتی بەنرخمان بۆ نەوەی داهاتوو.', date: '2024-06-01', category: 'culture' },
          { id: 5, titleEn: 'Digital Skills Workshop', titleKu: 'وۆرکشۆپی شارەزایی دیجیتاڵ', descriptionEn: 'Hands-on workshops teaching coding, social media management, and digital marketing to youth entrepreneurs.', descriptionKu: 'وۆرکشۆپی ئامۆژگاری کۆدنووسین، بەڕێوەبردنی میدیای کۆمەڵایەتی، و بازاڕکردنی دیجیتاڵ بۆ کارڕێکخستاری گەنج.', date: '2024-07-15', category: 'education' },
          { id: 6, titleEn: 'Mental Health Awareness Campaign', titleKu: 'کەمپەینی هۆشیارکردنەوەی تەندرووستی دروستی', descriptionEn: 'Breaking stigma and promoting mental wellbeing through community dialogue, workshops, and support networks.', descriptionKu: 'شکاندنی شەرم و پێشبرینی بەخێربوونی دروستی بە ڕێگەی گفتوگۆی کۆمەڵگا، وۆرکشۆپ، و تۆڕی پشتگیری.', date: '2024-08-05', category: 'health' },
        ];
        setActivities(fallback);
        setFiltered(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFiltered(activities);
    } else {
      setFiltered(activities.filter((a) => a.category === activeFilter));
    }
  }, [activeFilter, activities]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.activity-card-animate');
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (lang === 'ku') {
      return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (lang === 'ar') {
      return date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const filters = [
    { key: 'all', label: t.activities.filters.all },
    { key: 'training', label: t.activities.filters.training },
    { key: 'community', label: t.activities.filters.community },
    { key: 'sports', label: t.activities.filters.sports },
    { key: 'culture', label: t.activities.filters.culture },
    { key: 'education', label: t.activities.filters.education },
    { key: 'health', label: t.activities.filters.health },
  ];

  return (
    <section id="activities" className="activities-section" ref={sectionRef}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">{t.activities.tag}</span>
          <h2 className="section-title">{t.activities.title}</h2>
          <p className="section-description">{t.activities.description}</p>
        </div>

        {/* Filters */}
        <div className="activities-filters" role="group" aria-label="Activity filters">
          {filters.map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', gap: '12px', alignItems: 'center' }}>
            <div className="spinner" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>
              {lang === 'ku' ? 'بارکردن...' : lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontSize: '16px' }}>
            {t.activities.noActivities}
          </div>
        ) : (
          <div className="activities-grid" dir={isRTL ? 'rtl' : 'ltr'}>
            {filtered.map((activity, i) => (
              <div
                key={activity.id}
                id={`activity-card-${activity.id}`}
                className="activity-card activity-card-animate"
                style={{
                  opacity: 0,
                  transform: 'translateY(30px)',
                  transition: `opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease, border-color 0.3s ease`,
                }}
              >
                {/* Card Image / Placeholder */}
                <div className="activity-card-image">
                  <span className="activity-card-image-placeholder">
                    {CATEGORY_ICONS[activity.category] || '📌'}
                  </span>
                  <span className="activity-card-category">
                    {t.activities.filters[activity.category] || activity.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="activity-card-body">
                  <div className="activity-card-date">
                    <span>📅</span>
                    {formatDate(activity.date)}
                  </div>
                  <h3 className="activity-card-title">
                    {lang === 'ku' ? activity.titleKu : activity.titleEn}
                  </h3>
                  <p className="activity-card-desc">
                    {lang === 'ku' ? activity.descriptionKu : activity.descriptionEn}
                  </p>
                </div>

                <div className="activity-card-footer">
                  <span className="activity-read-more">
                    {t.activities.readMore}
                    <span>{isRTL ? '←' : '→'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
