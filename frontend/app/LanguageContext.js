'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LanguageContext = createContext(null);

const VALID_LANGS = ['en', 'ku', 'ar'];
const RTL_LANGS = ['ku', 'ar'];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const raw = localStorage.getItem('raparin-lang');
    const savedLang = VALID_LANGS.includes(raw) ? raw : 'en';
    const savedTheme = localStorage.getItem('raparin-theme') || 'light';
    if (raw && raw !== savedLang) localStorage.setItem('raparin-lang', savedLang);
    setLang(savedLang);
    setTheme(savedTheme);
    const rtl = RTL_LANGS.includes(savedLang);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang === 'ku' ? 'ckb' : savedLang;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const switchLang = (newLang) => {
    const validLang = VALID_LANGS.includes(newLang) ? newLang : 'en';
    setLang(validLang);
    localStorage.setItem('raparin-lang', validLang);
    const rtl = RTL_LANGS.includes(validLang);
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = validLang === 'ku' ? 'ckb' : validLang;
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('raparin-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const t = translations[lang];
  const isRTL = RTL_LANGS.includes(lang);
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
