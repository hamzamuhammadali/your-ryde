import { useTranslation } from '../../i18n';
import './HowItWorks.css';

const STEPS = [
  { key: 'step1', number: '01', icon: '📍' },
  { key: 'step2', number: '02', icon: '🚗' },
  { key: 'step3', number: '03', icon: '✅' },
];

const HowItWorks = () => {
  const { t } = useTranslation();

  return (
    <section className="how-section">
      <div className="container">
        <div className="how-header">
          <span className="how-label">{t('howItWorks.label')}</span>
          <h2 className="how-heading">{t('howItWorks.heading')}</h2>
        </div>
        <div className="how-grid">
          {STEPS.map((step, i) => (
            <div key={i} className="how-card">
              <div className="how-card-top">
                <span className="how-number">{step.number}</span>
                <span className="how-icon">{step.icon}</span>
              </div>
              <h3 className="how-title">{t(`howItWorks.${step.key}.title`)}</h3>
              <div className="how-divider" />
              <p className="how-desc">{t(`howItWorks.${step.key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
