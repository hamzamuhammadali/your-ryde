import { useTranslation } from '../../i18n';
import './FleetOptions.css';

const VEHICLES = [
  { key: 'economy', icon: '🚗', capacity: '1–4', luggage: '2' },
  { key: 'comfort', icon: '🚙', capacity: '1–4', luggage: '3' },
  { key: 'premium', icon: '🚘', capacity: '1–4', luggage: '4' },
  { key: 'van', icon: '🚐', capacity: '5–8', luggage: '6+' },
];

const FleetOptions = () => {
  const { t } = useTranslation();

  return (
    <section className="fleet-section">
      <div className="container">
        <div className="fleet-header">
          <span className="fleet-label">{t('fleet.label')}</span>
          <h2 className="fleet-heading">{t('fleet.heading')}</h2>
        </div>
        <div className="fleet-grid">
          {VEHICLES.map((v, i) => (
            <div key={i} className="fleet-card">
              <div className="fleet-card-top">
                <span className="fleet-icon">{v.icon}</span>
                <span className="fleet-price">{t(`fleet.${v.key}.price`)}</span>
              </div>
              <h3 className="fleet-type">{t(`fleet.${v.key}.type`)}</h3>
              <p className="fleet-desc">{t(`fleet.${v.key}.desc`)}</p>
              <div className="fleet-specs">
                <span className="fleet-spec">👥 {v.capacity} {t('fleet.passengers')}</span>
                <span className="fleet-spec">🧳 {v.luggage} {t('fleet.bags')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FleetOptions;
