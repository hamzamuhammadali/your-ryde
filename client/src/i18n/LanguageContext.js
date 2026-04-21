import { createContext, useState, useCallback, useEffect } from 'react';
import en from './en.json';
import es from './es.json';

const translations = { en, es };
export const SUPPORTED_LANGUAGES = ['en', 'es'];
export const DEFAULT_LANGUAGE = 'en';

export const LanguageContext = createContext();

// Dot-notation lookup: t('header.home') → translations[lang].header.home
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('ryde-lang');
    return SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((lang) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('ryde-lang', lang);
      document.documentElement.lang = lang;
    }
  }, []);

  // Sync html lang on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, replacements = {}) => {
    const value = getNestedValue(translations[language], key);
    if (value === null || value === undefined) {
      // Fallback to English
      const fallback = getNestedValue(translations.en, key);
      if (fallback === null || fallback === undefined) return key;
      if (typeof fallback === 'string') {
        return Object.entries(replacements).reduce(
          (str, [k, v]) => str.replace(`{${k}}`, v), fallback
        );
      }
      return fallback;
    }
    if (typeof value === 'string') {
      return Object.entries(replacements).reduce(
        (str, [k, v]) => str.replace(`{${k}}`, v), value
      );
    }
    return value; // Return objects/arrays as-is
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};
