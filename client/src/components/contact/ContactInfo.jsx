import { useTranslation } from '../../i18n';
import './ContactInfo.css';

const ContactInfo = () => {
  const { t } = useTranslation();

  return (
    <div className="ci-card">
      <div className="ci-item">
        <span className="ci-icon">📞</span>
        <div>
          <h4 className="ci-title">{t('contact.phone')}</h4>
          <p className="ci-value">+1 (555) 123-4567</p>
        </div>
      </div>
      <div className="ci-divider" />
      <div className="ci-item">
        <span className="ci-icon">📧</span>
        <div>
          <h4 className="ci-title">{t('contact.email')}</h4>
          <p className="ci-value">info@ryde.com</p>
        </div>
      </div>
      <div className="ci-divider" />
      <div className="ci-item">
        <span className="ci-icon">📍</span>
        <div>
          <h4 className="ci-title">{t('contact.address')}</h4>
          <p className="ci-value">123 Main Street, City 12345</p>
        </div>
      </div>
      <div className="ci-divider" />
      <div className="ci-item">
        <span className="ci-icon">⏰</span>
        <div>
          <h4 className="ci-title">{t('contact.hours')}</h4>
          <p className="ci-value">{t('contact.hoursValue')}</p>
        </div>
      </div>
      <div className="ci-social">
        <a href="#facebook" className="ci-social-link" aria-label="Facebook">📘</a>
        <a href="#twitter" className="ci-social-link" aria-label="Twitter">🐦</a>
        <a href="#instagram" className="ci-social-link" aria-label="Instagram">📷</a>
        <a href="#linkedin" className="ci-social-link" aria-label="LinkedIn">💼</a>
      </div>
    </div>
  );
};

export default ContactInfo;
