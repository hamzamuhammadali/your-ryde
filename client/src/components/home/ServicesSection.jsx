import { useTranslation } from '../../i18n';
import './ServicesSection.css';

const SERVICE_KEYS = [
  { key: 'airportTransfer', icon: '🏢' },
  { key: 'cityRides', icon: '🏙️' },
  { key: 'nightService', icon: '🌃' },
  { key: 'corporateTravel', icon: '💼' },
  { key: 'specialEvents', icon: '🎉' },
];

const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="services-section" id="services">
      <div className="container">
        <div className="services-header">
          <span className="services-label">{t('services.label')}</span>
          <h2 className="services-heading">{t('services.heading')}</h2>
        </div>
        <div className="services-grid">
          {SERVICE_KEYS.map((svc, i) => (
            <div key={i} className="svc-card">
              <span className="svc-icon">{svc.icon}</span>
              <h3 className="svc-title">{t(`services.${svc.key}.title`)}</h3>
              <div className="svc-divider" />
              <p className="svc-desc">{t(`services.${svc.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
