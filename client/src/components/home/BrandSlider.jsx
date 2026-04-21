import { useTranslation } from '../../i18n';
import './BrandSlider.css';

const BRANDS = [
  { name: 'Toyota', text: 'TOYOTA' },
  { name: 'Honda', text: 'HONDA' },
  { name: 'Mercedes-Benz', text: 'Mercedes-Benz' },
  { name: 'BMW', text: 'BMW' },
  { name: 'Hyundai', text: 'HYUNDAI' },
  { name: 'Suzuki', text: 'SUZUKI' },
  { name: 'Nissan', text: 'NISSAN' },
  { name: 'Kia', text: 'KIA' },
  { name: 'Volkswagen', text: 'Volkswagen' },
  { name: 'Ford', text: 'FORD' },
  { name: 'Chevrolet', text: 'Chevrolet' },
  { name: 'Audi', text: 'AUDI' },
];

const BrandSlider = () => {
  const { t } = useTranslation();
  const allBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="brand-slider">
      <div className="container">
        <h2 className="brand-slider-title">{t('brandSlider.heading')}</h2>
      </div>
      <div className="brand-slider-track-wrapper">
        <div className="brand-slider-track">
          {allBrands.map((brand, i) => (
            <div className="brand-item" key={i}>
              <span className="brand-text">{brand.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
