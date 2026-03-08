'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const raw = localStorage.getItem('raparin-lang');
    const savedLang = raw === 'ku' ? 'ku' : 'en';
    const savedTheme = localStorage.getItem('raparin-theme') || 'light';
    if (raw && raw !== savedLang) localStorage.setItem('raparin-lang', savedLang);
    setLang(savedLang);
    setTheme(savedTheme);
    document.documentElement.dir = savedLang === 'ku' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang === 'ku' ? 'ckb' : 'en';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const switchLang = (newLang) => {
    const validLang = newLang === 'ku' ? 'ku' : 'en';
    setLang(validLang);
    localStorage.setItem('raparin-lang', validLang);
    document.documentElement.dir = validLang === 'ku' ? 'rtl' : 'ltr';
    document.documentElement.lang = validLang === 'ku' ? 'ckb' : 'en';
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('raparin-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const t = translations[lang];
  const isRTL = lang === 'ku';
  const isDark = theme === 'dark';

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t, isRTL, theme, toggleTheme, isDark }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
