import { Link, useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import './About.css';

const About = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const l = lang || 'en';
  const values = t('about.values');

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-banner">
            <h1 className="about-hero-title">{t('about.heroTitle')}</h1>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="container">
          <div className="about-story-header">
            <span className="about-label">{t('about.storyLabel')}</span>
            <h2 className="about-heading">{t('about.storyHeading')}</h2>
          </div>
          <div className="about-story-grid">
            <div className="about-story-text">
              <p>{t('about.storyP1')}</p>
              <p>{t('about.storyP2')}</p>
            </div>
            <div className="about-story-visual">
              <div className="about-visual-card">
                <span className="about-visual-emoji">🚗</span>
                <p>{t('about.professionalFleet')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="container">
          <div className="about-values-header">
            <span className="about-label">{t('about.valuesLabel')}</span>
            <h2 className="about-heading">{t('about.valuesHeading')}</h2>
          </div>
          <div className="about-values-grid">
            <div className="about-vcard">
              <span className="about-vcard-icon">🎯</span>
              <h3 className="about-vcard-title">{t('about.mission.title')}</h3>
              <div className="about-vcard-divider" />
              <p>{t('about.mission.desc')}</p>
            </div>
            <div className="about-vcard">
              <span className="about-vcard-icon">💎</span>
              <h3 className="about-vcard-title">{values.title}</h3>
              <div className="about-vcard-divider" />
              <ul className="about-vcard-list">
                {(values.items || []).map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="about-vcard">
              <span className="about-vcard-icon">🌟</span>
              <h3 className="about-vcard-title">{t('about.vision.title')}</h3>
              <div className="about-vcard-divider" />
              <p>{t('about.vision.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-features">
        <div className="container">
          <div className="about-features-header">
            <span className="about-label">{t('about.featuresLabel')}</span>
            <h2 className="about-heading">{t('about.featuresHeading')}</h2>
          </div>
          <div className="about-features-grid">
            {['safety', 'availability', 'pricing', 'booking', 'fleet', 'drivers'].map((key) => (
              <div key={key} className="about-fcard">
                <span className="about-fcard-icon">{key === 'safety' ? '🛡️' : key === 'availability' ? '⏰' : key === 'pricing' ? '💰' : key === 'booking' ? '📱' : key === 'fleet' ? '🚗' : '👨‍💼'}</span>
                <h3 className="about-fcard-title">{t(`about.features.${key}.title`)}</h3>
                <div className="about-fcard-divider" />
                <p className="about-fcard-desc">{t(`about.features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <span className="about-label">{t('about.ctaLabel')}</span>
            <h2 className="about-cta-heading">{t('about.ctaHeading')}</h2>
            <p className="about-cta-text">{t('about.ctaText')}</p>
            <Link to={`/${l}`} className="about-cta-btn">
              {t('about.ctaButton')}
              <span className="about-cta-arrow">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
