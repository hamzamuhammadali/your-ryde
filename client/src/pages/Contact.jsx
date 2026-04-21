import { useParams } from 'react-router-dom';
import { useTranslation } from '../i18n';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const l = lang || 'en';

  return (
    <div className="contact-page">
      <section className="ct-hero">
        <div className="container">
          <div className="ct-hero-banner">
            <h1 className="ct-hero-title">{t('contact.heroTitle')}</h1>
          </div>
        </div>
      </section>

      <section className="ct-main">
        <div className="container">
          <div className="ct-main-header">
            <span className="ct-label">{t('contact.mainLabel')}</span>
            <h2 className="ct-heading">{t('contact.mainHeading')}</h2>
            <p className="ct-subtitle">{t('contact.mainSubtitle')}</p>
          </div>
          <div className="ct-grid">
            <div className="ct-info-col"><ContactInfo /></div>
            <div className="ct-form-col"><ContactForm /></div>
          </div>
        </div>
      </section>

      <section className="ct-links">
        <div className="container">
          <div className="ct-links-header">
            <span className="ct-label">{t('contact.linksLabel')}</span>
            <h2 className="ct-heading">{t('contact.linksHeading')}</h2>
          </div>
          <div className="ct-links-grid">
            <div className="ct-link-card">
              <span className="ct-link-icon">🚗</span>
              <h3 className="ct-link-title">{t('contact.quickBooking.title')}</h3>
              <div className="ct-link-divider" />
              <p className="ct-link-desc">{t('contact.quickBooking.desc')}</p>
              <a href={`/${l}`} className="ct-link-action">{t('contact.bookNow')} ↗</a>
            </div>
            <div className="ct-link-card">
              <span className="ct-link-icon">❓</span>
              <h3 className="ct-link-title">{t('contact.faqLink.title')}</h3>
              <div className="ct-link-divider" />
              <p className="ct-link-desc">{t('contact.faqLink.desc')}</p>
              <a href={`/${l}#faq`} className="ct-link-action">{t('contact.viewFaq')} ↗</a>
            </div>
            <div className="ct-link-card">
              <span className="ct-link-icon">📋</span>
              <h3 className="ct-link-title">{t('contact.aboutRyde.title')}</h3>
              <div className="ct-link-divider" />
              <p className="ct-link-desc">{t('contact.aboutRyde.desc')}</p>
              <a href={`/${l}/about`} className="ct-link-action">{t('contact.learnMore')} ↗</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
