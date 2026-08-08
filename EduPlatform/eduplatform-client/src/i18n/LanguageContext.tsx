import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import type { Lang } from './translations';

// ── Context ───────────────────────────────────────────────────────────────────
interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (section: string, key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ar',
  setLang: () => {},
  t: () => '',
  isRTL: true,
});

// ── Provider ──────────────────────────────────────────────────────────────────
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('edu_lang') as Lang) || 'ar';
  });

  const isRTL = lang === 'ar';

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('edu_lang', newLang);
  };

  // Apply RTL/LTR to the document
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.style.fontFamily = isRTL
      ? "'Cairo', sans-serif"
      : "'Space Grotesk', 'Cairo', sans-serif";
  }, [lang, isRTL]);

  // Translation function
  const t = (section: string, key: string): string => {
    try {
      const sectionData = (translations as Record<string, Record<string, Record<Lang, string>>>)[section];
      if (!sectionData) return key;
      const entry = sectionData[key];
      if (!entry) return key;
      return entry[lang] || entry['ar'] || key;
    } catch {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useLanguage = () => useContext(LanguageContext);

// ── Language Toggle Button Component ─────────────────────────────────────────
export const LangToggle: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
      title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 14px',
        borderRadius: '9999px',
        background: 'rgba(245,200,66,.08)',
        border: '1.5px solid rgba(245,200,66,.22)',
        color: '#F5C842',
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: lang === 'ar' ? "'Space Grotesk', sans-serif" : "'Cairo', sans-serif",
        transition: 'all .2s',
        letterSpacing: lang === 'en' ? '.03em' : 'normal',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.16)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'rgba(245,200,66,.08)';
        (e.currentTarget as HTMLElement).style.transform = 'none';
      }}
    >
      {/* Globe icon */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
      {lang === 'ar' ? 'EN' : 'عربي'}
    </button>
  );
};
