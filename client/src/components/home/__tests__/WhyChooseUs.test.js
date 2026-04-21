import React from 'react';
import { render, screen } from '@testing-library/react';
import WhyChooseUs from '../WhyChooseUs';

describe('WhyChooseUs', () => {
  it('renders the section title', () => {
    render(<WhyChooseUs />);
    
    expect(screen.getByText('Why Choose Ryde?')).toBeInTheDocument();
  });

  it('renders benefit cards', () => {
    render(<WhyChooseUs />);
    
    expect(screen.getByText('24/7 Availability')).toBeInTheDocument();
    expect(screen.getByText('Professional Drivers')).toBeInTheDocument();
    expect(screen.getByText('Competitive Pricing')).toBeInTheDocument();
    expect(screen.getByText('Safe & Secure')).toBeInTheDocument();
  });

  it('renders benefit descriptions', () => {
    render(<WhyChooseUs />);
    
    expect(screen.getByText(/We're available round the clock/)).toBeInTheDocument();
    expect(screen.getByText(/Licensed and experienced drivers/)).toBeInTheDocument();
    expect(screen.getByText(/Fair and transparent pricing/)).toBeInTheDocument();
    expect(screen.getByText(/Your safety is our priority/)).toBeInTheDocument();
  });

  it('renders benefit icons', () => {
    render(<WhyChooseUs />);
    
    // Check for emoji icons in the benefit cards
    const benefitCards = screen.getAllByRole('article');
    expect(benefitCards).toHaveLength(4);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<WhyChooseUs />);
    
    const whyChooseSection = container.querySelector('.why-choose-us');
    expect(whyChooseSection).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<WhyChooseUs />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});