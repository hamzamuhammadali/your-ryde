import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroBanner from '../HeroBanner';

// Mock the BookingForm component
jest.mock('../BookingForm', () => {
  return function MockBookingForm() {
    return <div data-testid="booking-form">Booking Form</div>;
  };
});

describe('HeroBanner', () => {
  it('renders the main heading', () => {
    render(<HeroBanner />);
    
    expect(screen.getByText('Your Reliable Ride, Anytime, Anywhere')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<HeroBanner />);
    
    expect(screen.getByText(/Book your taxi in seconds/)).toBeInTheDocument();
  });

  it('renders the booking form', () => {
    render(<HeroBanner />);
    
    expect(screen.getByTestId('booking-form')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<HeroBanner />);
    
    const heroSection = container.querySelector('.hero-banner');
    expect(heroSection).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<HeroBanner />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});