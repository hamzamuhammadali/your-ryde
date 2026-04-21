import BookingForm from './BookingForm';
import { useTranslation } from '../../i18n';
import './HeroBanner.css';

const HeroBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            {t('hero.title1')}<br />
            <span className="hero-title-accent">{t('hero.title2')}</span><br />
            {t('hero.title3')}
          </h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-ctas">
            <a href="#book" className="hero-btn hero-btn--primary">
              {t('hero.ctaPrimary')}
              <span className="hero-btn-arrow">↗</span>
            </a>
            <a href="#services" className="hero-btn hero-btn--outline">
              {t('hero.ctaSecondary')}
              <span className="hero-btn-arrow hero-btn-arrow--dark">↗</span>
            </a>
          </div>
        </div>
        <div className="hero-form-wrapper" id="book">
          <div className="hero-form">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
