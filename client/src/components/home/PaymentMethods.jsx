import { useTranslation } from '../../i18n';
import './PaymentMethods.css';

const PAYMENT_METHODS = [
  { name: 'Visa', icon: '💳' },
  { name: 'MasterCard', icon: '💳' },
  { name: 'American Express', icon: '💳' },
  { name: 'PayPal', icon: '🅿️' },
  { name: 'Apple Pay', icon: '📱' },
  { name: 'Google Pay', icon: '📱' },
  { name: 'Samsung Pay', icon: '📱' },
  { name: 'Cash', icon: '💵' },
  { name: 'Bank Transfer', icon: '🏦' },
  { name: 'Venmo', icon: '💸' },
  { name: 'Cash App', icon: '💰' },
];

const PaymentMethods = () => {
  const { t } = useTranslation();
  const allMethods = [...PAYMENT_METHODS, ...PAYMENT_METHODS];

  return (
    <section className="payment-slider-section">
      <div className="container">
        <div className="payment-header">
          <span className="payment-label">{t('paymentMethods.label')}</span>
          <h2 className="payment-slider-title">{t('paymentMethods.heading')}</h2>
        </div>
      </div>
      <div className="payment-track-wrapper">
        <div className="payment-track">
          {allMethods.map((method, i) => (
            <div className="payment-item" key={i}>
              <span className="payment-icon">{method.icon}</span>
              <span className="payment-name">{method.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="container">
        <div className="payment-badges">
          <div className="payment-badge">
            <span className="badge-icon">🔒</span>
            <div>
              <h4>{t('paymentMethods.securePayments')}</h4>
              <p>{t('paymentMethods.securePaymentsDesc')}</p>
            </div>
          </div>
          <div className="payment-badge">
            <span className="badge-icon">✅</span>
            <div>
              <h4>{t('paymentMethods.noHiddenFees')}</h4>
              <p>{t('paymentMethods.noHiddenFeesDesc')}</p>
            </div>
          </div>
          <div className="payment-badge">
            <span className="badge-icon">💯</span>
            <div>
              <h4>{t('paymentMethods.reliable')}</h4>
              <p>{t('paymentMethods.reliableDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentMethods;
