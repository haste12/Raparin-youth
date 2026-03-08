'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../LanguageContext';

const CATEGORY_ICONS = {
  training: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  community: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  sports: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/></svg>,
  culture: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><circle cx="12" cy="12" r="10"/></svg>,
  education: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  health: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
};

const PinIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const CalendarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(2px)', marginRight: '4px', marginLeft: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

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
                  transition: `opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease`,
                }}
              >
                {/* Card Image / Placeholder */}
                <div className="activity-card-image">
                  <span className="activity-card-image-placeholder">
                    {CATEGORY_ICONS[activity.category] || <PinIcon />}
                  </span>
                  <span className="activity-card-category">
                    {t.activities.filters[activity.category] || activity.category}
                  </span>
                </div>

                {/* Card Body */}
                <div className="activity-card-body">
                  <div className="activity-card-date">
                    <CalendarIcon />
                    {formatDate(activity.date)}
                  </div>
                  <h3 className="activity-card-title">
                    {lang === 'ku' ? (activity.titleKu || activity.titleEn) : lang === 'ar' ? (activity.titleAr || activity.titleKu || activity.titleEn) : activity.titleEn}
                  </h3>
                  <p className="activity-card-desc">
                    {lang === 'ku' ? (activity.shortDescKu || activity.descriptionKu || activity.shortDescEn || activity.descriptionEn) : lang === 'ar' ? (activity.shortDescAr || activity.shortDescKu || activity.descriptionKu || activity.shortDescEn || activity.descriptionEn) : (activity.shortDescEn || activity.descriptionEn)}
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
