import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import './Footer.css';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 420px;
  background-color: var(--primary-black);
  color: var(--primary-white);
  padding: 5rem 0 1.5rem 0;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  @media (max-width: 768px) { height: 480px; padding: 4rem 0 1rem 0; }
  @media (max-width: 480px) { height: 560px; padding: 3.5rem 0 0.5rem 0; }
`;

const Footer = () => {
  const { t } = useTranslation();
  const { lang } = useParams();
  const currentYear = new Date().getFullYear();
  const l = lang || 'en';

  return (
    <FooterContainer className="main-footer">
      <div className="container" style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: 'var(--primary-yellow)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('footer.services')}</h4>
            <a href={`/${l}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.airportTransfer')}</a>
            <a href={`/${l}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.cityRides')}</a>
            <a href={`/${l}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.scheduledRides')}</a>
            <a href={`/${l}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.corporateServices')}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: 'var(--primary-yellow)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('footer.support')}</h4>
            <a href={`/${l}/contact`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.contactUs')}</a>
            <a href="#help" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.helpCenter')}</a>
            <a href={`/${l}`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.faqLink')}</a>
            <a href="#safety" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.safetyGuidelines')}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: 'var(--primary-yellow)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('footer.company')}</h4>
            <a href={`/${l}/about`} style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.aboutUs')}</a>
            <a href="#careers" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.careers')}</a>
            <a href="#press" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.press')}</a>
            <a href="#blog" style={{ color: '#ccc', textDecoration: 'none', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{t('footer.blog')}</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ color: 'var(--primary-yellow)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('footer.contactInfo')}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>📞 +1 (555) 123-4567</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#ccc' }}>✉️ info@ryde.com</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#ccc' }}>📍 123 Main Street<br />City, State 12345</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>
            {t('footer.copyright', { year: currentYear })}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#facebook" aria-label="Facebook" style={{ color: '#ccc', fontSize: '1.2rem', textDecoration: 'none' }}>📘</a>
            <a href="#twitter" aria-label="Twitter" style={{ color: '#ccc', fontSize: '1.2rem', textDecoration: 'none' }}>🐦</a>
            <a href="#instagram" aria-label="Instagram" style={{ color: '#ccc', fontSize: '1.2rem', textDecoration: 'none' }}>📷</a>
            <a href="#linkedin" aria-label="LinkedIn" style={{ color: '#ccc', fontSize: '1.2rem', textDecoration: 'none' }}>💼</a>
          </div>
        </div>
      </div>
    </FooterContainer>
  );
};

export default Footer;
