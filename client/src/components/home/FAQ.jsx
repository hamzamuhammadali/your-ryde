import { useState } from 'react';
import { useTranslation } from '../../i18n';
import './FAQ.css';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const { t } = useTranslation();

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="container">
        <div className="faq-header">
          <span className="faq-label">{t('faq.label')}</span>
          <h2 className="faq-heading">{t('faq.heading')}</h2>
          <p className="faq-subtitle">{t('faq.subtitle')}</p>
        </div>
        <div className="faq-list">
          {FAQ_KEYS.map((key, index) => (
            <div key={key} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
              >
                <span>{t(`faq.${key}.q`)}</span>
                <span className="faq-toggle">{activeIndex === index ? '−' : '+'}</span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">{t(`faq.${key}.a`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
