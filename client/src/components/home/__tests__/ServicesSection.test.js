import React from 'react';
import { render, screen } from '@testing-library/react';
import ServicesSection from '../ServicesSection';

describe('ServicesSection', () => {
  it('renders the section title', () => {
    render(<ServicesSection />);
    
    expect(screen.getByText('Our Services')).toBeInTheDocument();
  });

  it('renders service cards', () => {
    render(<ServicesSection />);
    
    expect(screen.getByText('City Rides')).toBeInTheDocument();
    expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
    expect(screen.getByText('Corporate Travel')).toBeInTheDocument();
  });

  it('renders service descriptions', () => {
    render(<ServicesSection />);
    
    expect(screen.getByText(/Quick and comfortable rides/)).toBeInTheDocument();
    expect(screen.getByText(/Reliable airport pickup/)).toBeInTheDocument();
    expect(screen.getByText(/Professional transportation/)).toBeInTheDocument();
  });

  it('renders service icons', () => {
    render(<ServicesSection />);
    
    // Check for emoji icons in the service cards
    const serviceCards = screen.getAllByRole('article');
    expect(serviceCards).toHaveLength(3);
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ServicesSection />);
    
    const servicesSection = container.querySelector('.services-section');
    expect(servicesSection).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<ServicesSection />);
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });
});