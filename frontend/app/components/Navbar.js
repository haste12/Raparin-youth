'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '../LanguageContext';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar({ activeSection }) {
  const { lang, switchLang, t, isRTL, isDark, toggleTheme } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isActivitiesPage = pathname === '/activities';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const handleNavClick = (id) => {
    setMobileOpen(false);
    if (id === 'activities') {
      router.push('/activities');
      return;
    }
    if (!isHomePage) {
      // Navigate home then scroll
      router.push(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Determine the active nav item
  const getActiveClass = (id) => {
    if (id === 'activities') return isActivitiesPage ? 'active' : '';
    if (isHomePage) return activeSection === id ? 'active' : '';
    return '';
  };

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'activities', label: t.nav.activities },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          {/* Logo */}
          <Link href="/" className="navbar-logo" aria-label="Raparin Youth Organization – Home">
            <img src="/logo.png" alt="Raparin Youth Organization Logo" />
            <div className="navbar-logo-text">
              <span className="navbar-logo-title" suppressHydrationWarning>
                {lang === 'ku' ? 'ڕێکخراوی گەنجانی ڕاپەڕین' : lang === 'ar' ? 'منظمة شباب رابارين' : 'Raparin Youth'}
              </span>
              <span className="navbar-logo-subtitle" suppressHydrationWarning>
                {lang === 'ku' ? 'دامەزراوە ٢٠٢٢' : lang === 'ar' ? 'تأسست ٢٠٢٢' : 'Organization'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="navbar-nav">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  id={`nav-${item.id}`}
                  className={`nav-link ${getActiveClass(item.id)}`}
                  onClick={() => handleNavClick(item.id)}
                  style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
                  suppressHydrationWarning
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            <div className="lang-switcher" role="group" aria-label="Language switcher">
              <button
                id="lang-en"
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => switchLang('en')}
                suppressHydrationWarning
              >
                EN
              </button>
              <button
                id="lang-ku"
                className={`lang-btn ${lang === 'ku' ? 'active' : ''}`}
                onClick={() => switchLang('ku')}
                suppressHydrationWarning
              >
                کوردی
              </button>
              <button
                id="lang-ar"
                className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
                onClick={() => switchLang('ar')}
                suppressHydrationWarning
              >
                عربی
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Light mode' : 'Dark mode'}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span style={{
                transform: mobileOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
                transition: 'transform 0.25s ease'
              }} />
              <span style={{
                opacity: mobileOpen ? 0 : 1,
                transition: 'opacity 0.25s ease'
              }} />
              <span style={{
                transform: mobileOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
                transition: 'transform 0.25s ease'
              }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${getActiveClass(item.id)}`}
            onClick={() => handleNavClick(item.id)}
            style={{
              background: 'none', border: 'none', fontFamily: 'inherit',
              width: '100%', textAlign: isRTL ? 'right' : 'left',
            }}
          >
            {item.label}
          </button>
        ))}
        <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '8px' }}>
          <button
            className="btn-primary"
            onClick={() => { handleNavClick('contact'); }}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t.nav.getInvolved}
          </button>
        </div>
      </div>
    </>
  );
}
