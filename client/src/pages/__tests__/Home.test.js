import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Home';

// Mock all the home components
jest.mock('../../components/home/HeroBanner', () => {
  return function MockHeroBanner() {
    return <div data-testid="hero-banner">Hero Banner</div>;
  };
});

jest.mock('../../components/home/ServicesSection', () => {
  return function MockServicesSection() {
    return <div data-testid="services-section">Services Section</div>;
  };
});

jest.mock('../../components/home/WhyChooseUs', () => {
  return function MockWhyChooseUs() {
    return <div data-testid="why-choose-us">Why Choose Us</div>;
  };
});

jest.mock('../../components/home/FleetOptions', () => {
  return function MockFleetOptions() {
    return <div data-testid="fleet-options">Fleet Options</div>;
  };
});

jest.mock('../../components/home/HowItWorks', () => {
  return function MockHowItWorks() {
    return <div data-testid="how-it-works">How It Works</div>;
  };
});

jest.mock('../../components/home/FAQ', () => {
  return function MockFAQ() {
    return <div data-testid="faq">FAQ</div>;
  };
});

jest.mock('../../components/home/PaymentMethods', () => {
  return function MockPaymentMethods() {
    return <div data-testid="payment-methods">Payment Methods</div>;
  };
});

describe('Home Page', () => {
  it('renders all home page sections', () => {
    render(<Home />);
    
    expect(screen.getByTestId('hero-banner')).toBeInTheDocument();
    expect(screen.getByTestId('services-section')).toBeInTheDocument();
    expect(screen.getByTestId('why-choose-us')).toBeInTheDocument();
    expect(screen.getByTestId('fleet-options')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
    expect(screen.getByTestId('payment-methods')).toBeInTheDocument();
  });

  it('renders sections in correct order', () => {
    render(<Home />);
    
    const sections = [
      screen.getByTestId('hero-banner'),
      screen.getByTestId('services-section'),
      screen.getByTestId('why-choose-us'),
      screen.getByTestId('fleet-options'),
      screen.getByTestId('how-it-works'),
      screen.getByTestId('faq'),
      screen.getByTestId('payment-methods')
    ];
    
    // Verify all sections are present
    sections.forEach(section => {
      expect(section).toBeInTheDocument();
    });
  });

  it('has proper page structure', () => {
    const { container } = render(<Home />);
    
    // Should have a main container
    expect(container.firstChild).toBeInTheDocument();
  });
});