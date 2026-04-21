import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import './Header.css';

const LANG_OPTIONS = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t, language } = useTranslation();

  const currentLang = lang || language || 'en';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => {
    const currentPath = location.pathname.replace(`/${currentLang}`, '') || '/';
    return currentPath === path || (path === '/' && currentPath === '');
  };

  const switchLanguage = (newLang) => {
    const pathWithoutLang = location.pathname.replace(`/${currentLang}`, '') || '';
    navigate(`/${newLang}${pathWithoutLang}`);
    setIsLangOpen(false);
  };

  const currentLangOption = LANG_OPTIONS.find(l => l.code === currentLang) || LANG_OPTIONS[0];

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <div className="header-inner">
        <nav className="header-nav">
          <Link to={`/${currentLang}`} className="header-logo" onClick={closeMenu}>
            <span className="logo-icon">🚕</span>
            <span className="logo-text">Ryde</span>
          </Link>

          <ul className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
            <li>
              <Link to={`/${currentLang}`} className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
                {t('header.home')}
              </Link>
            </li>
            <li>
              <Link to={`/${currentLang}/about`} className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={closeMenu}>
                {t('header.about')}
              </Link>
            </li>
            <li>
              <Link to={`/${currentLang}/contact`} className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={closeMenu}>
                {t('header.contact')}
              </Link>
            </li>
          </ul>

          <div className="header-actions">
            {/* Language Selector */}
            <div className="lang-selector" ref={langRef}>
              <button
                className="lang-current"
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select language"
                aria-expanded={isLangOpen}
              >
                <span className="lang-flag">{currentLangOption.flag}</span>
                <span className="lang-code">{currentLang.toUpperCase()}</span>
                <span className="lang-chevron">{isLangOpen ? '▲' : '▼'}</span>
              </button>
              {isLangOpen && (
                <div className="lang-dropdown">
                  {LANG_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      className={`lang-option ${opt.code === currentLang ? 'active' : ''}`}
                      onClick={() => switchLanguage(opt.code)}
                    >
                      <span className="lang-flag">{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link to={`/${currentLang}/contact`} className="header-cta" onClick={closeMenu}>
              {t('header.bookARide')}
              <span className="cta-arrow">↗</span>
            </Link>
          </div>

          <button
            className="mobile-toggle"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
