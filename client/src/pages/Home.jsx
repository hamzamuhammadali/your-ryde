import React from 'react';
import HeroBanner from '../components/home/HeroBanner';
import BrandSlider from '../components/home/BrandSlider';
import ServicesSection from '../components/home/ServicesSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FleetOptions from '../components/home/FleetOptions';
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';
import PaymentMethods from '../components/home/PaymentMethods';

const Home = () => {
  return (
    <div className="home-page" style={{ borderRadius: '0px 0px 70px 70px' }}>
      <HeroBanner />
      <BrandSlider />
      <ServicesSection />
      <FleetOptions />
      <WhyChooseUs />
      <HowItWorks />
      <FAQ />
      <PaymentMethods />
    </div>
  );
};

export default Home;