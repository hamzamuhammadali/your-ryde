import { useTranslation } from '../../i18n';
import { useParams } from 'react-router-dom';
import './WhyChooseUs.css';

const BENEFIT_KEYS = [
  { key: 'professionalDrivers', icon: '⭐' },
  { key: 'competitivePricing', icon: '💰' },
  { key: 'easyBooking', icon: '📱' },
  { key: 'safeSecure', icon: '🛡️' },
  { key: 'cleanVehicles', icon: '🚗' },
  { key: 'onTimeService', icon: '⏰' },
];

const WhyChooseUs = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <section className="why-section">
      <div className="container">
        <div className="why-header">
          <span className="why-label">{t('whyChooseUs.label')}</span>
          <h2 className="why-heading">{t('whyChooseUs.heading')}</h2>
        </div>
        <div className="why-grid">
          {BENEFIT_KEYS.map((b, i) => (
            <div key={i} className="why-card">
              <span className="why-icon">{b.icon}</span>
              <h3 className="why-title">{t(`whyChooseUs.${b.key}.title`)}</h3>
              <div className="why-divider" />
              <p className="why-desc">{t(`whyChooseUs.${b.key}.desc`)}</p>
            </div>
          ))}
        </div>
        <div className="why-cta">
          <p className="why-cta-text">{t('whyChooseUs.ctaText')}</p>
          <a href={`/${lang || 'en'}/contact`} className="why-cta-btn">
            {t('whyChooseUs.ctaButton')}
            <span className="why-cta-arrow">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
