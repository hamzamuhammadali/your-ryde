import React from 'react';
import { render, screen } from '@testing-library/react';
import HeroBanner from '../HeroBanner';
import ServicesSection from '../ServicesSection';
import WhyChooseUs from '../WhyChooseUs';
import FleetOptions from '../FleetOptions';
import HowItWorks from '../HowItWorks';
import FAQ from '../FAQ';
import PaymentMethods from '../PaymentMethods';

// Mock the BookingForm component since it's tested separately
jest.mock('../BookingForm', () => {
  return function MockBookingForm() {
    return <div data-testid="booking-form">Booking Form</div>;
  };
});

describe('Home Page Sections', () => {
  describe('HeroBanner', () => {
    test('renders hero banner with title and booking form', () => {
      render(<HeroBanner />);
      expect(screen.getByText(/Your Reliable/)).toBeInTheDocument();
      expect(screen.getByText(/Taxi Service/)).toBeInTheDocument();
      expect(screen.getByTestId('booking-form')).toBeInTheDocument();
    });

    test('displays hero features', () => {
      render(<HeroBanner />);
      expect(screen.getByText('Professional Drivers')).toBeInTheDocument();
      expect(screen.getByText('24/7 Service')).toBeInTheDocument();
      expect(screen.getByText('Multiple Payment Options')).toBeInTheDocument();
    });
  });

  describe('ServicesSection', () => {
    test('renders services section with title', () => {
      render(<ServicesSection />);
      expect(screen.getByText('Our Services')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive transportation solutions/)).toBeInTheDocument();
    });

    test('displays all service cards', () => {
      render(<ServicesSection />);
      expect(screen.getByText('Airport Transfer')).toBeInTheDocument();
      expect(screen.getByText('City Rides')).toBeInTheDocument();
      expect(screen.getByText('Night Service')).toBeInTheDocument();
      expect(screen.getByText('Group Travel')).toBeInTheDocument();
      expect(screen.getByText('Corporate Travel')).toBeInTheDocument();
      expect(screen.getByText('Special Events')).toBeInTheDocument();
    });
  });

  describe('WhyChooseUs', () => {
    test('renders why choose us section', () => {
      render(<WhyChooseUs />);
      expect(screen.getByText('Why Choose Ryde?')).toBeInTheDocument();
      expect(screen.getByText(/Experience the difference/)).toBeInTheDocument();
    });

    test('displays all benefits', () => {
      render(<WhyChooseUs />);
      expect(screen.getByText('Professional Drivers')).toBeInTheDocument();
      expect(screen.getByText('Competitive Pricing')).toBeInTheDocument();
      expect(screen.getByText('Easy Booking')).toBeInTheDocument();
      expect(screen.getByText('Safe & Secure')).toBeInTheDocument();
      expect(screen.getByText('Clean Vehicles')).toBeInTheDocument();
      expect(screen.getByText('On-Time Service')).toBeInTheDocument();
    });

    test('displays call to action section', () => {
      render(<WhyChooseUs />);
      expect(screen.getByText(/Ready to Experience Premium Transportation/)).toBeInTheDocument();
      expect(screen.getByText('Book Your Ride Now')).toBeInTheDocument();
    });
  });

  describe('FleetOptions', () => {
    test('renders fleet options section', () => {
      render(<FleetOptions />);
      expect(screen.getByText('Our Fleet')).toBeInTheDocument();
      expect(screen.getByText(/Choose from our diverse range/)).toBeInTheDocument();
    });

    test('displays all vehicle types', () => {
      render(<FleetOptions />);
      expect(screen.getByText('Economy')).toBeInTheDocument();
      expect(screen.getByText('Comfort')).toBeInTheDocument();
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Van')).toBeInTheDocument();
    });

    test('displays vehicle specifications', () => {
      render(<FleetOptions />);
      expect(screen.getAllByText('1-4 passengers')).toHaveLength(3);
      expect(screen.getByText('5-8 passengers')).toBeInTheDocument();
      expect(screen.getByText(/Starting from \$15/)).toBeInTheDocument();
    });
  });

  describe('HowItWorks', () => {
    test('renders how it works section', () => {
      render(<HowItWorks />);
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText(/Getting your ride is simple/)).toBeInTheDocument();
    });

    test('displays all steps', () => {
      render(<HowItWorks />);
      expect(screen.getByText('Book Your Ride')).toBeInTheDocument();
      expect(screen.getByText('Get Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Track Your Driver')).toBeInTheDocument();
      expect(screen.getByText('Enjoy Your Ride')).toBeInTheDocument();
    });

    test('displays process CTA', () => {
      render(<HowItWorks />);
      expect(screen.getByText(/Ready to get started/)).toBeInTheDocument();
      expect(screen.getByText('Start Booking')).toBeInTheDocument();
    });
  });

  describe('FAQ', () => {
    test('renders FAQ section', () => {
      render(<FAQ />);
      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
      expect(screen.getByText(/Find answers to common questions/)).toBeInTheDocument();
    });

    test('displays FAQ questions', () => {
      render(<FAQ />);
      expect(screen.getByText('How do I book a ride?')).toBeInTheDocument();
      expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
      expect(screen.getByText('Can I schedule a ride in advance?')).toBeInTheDocument();
    });

    test('displays contact section', () => {
      render(<FAQ />);
      expect(screen.getByText('Still have questions?')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });
  });

  describe('PaymentMethods', () => {
    test('renders payment methods section', () => {
      render(<PaymentMethods />);
      expect(screen.getByText('Payment Methods')).toBeInTheDocument();
      expect(screen.getByText(/We accept multiple payment options/)).toBeInTheDocument();
    });

    test('displays payment categories', () => {
      render(<PaymentMethods />);
      expect(screen.getByText('Digital Payments')).toBeInTheDocument();
    });

    test('displays security badges', () => {
      render(<PaymentMethods />);
      expect(screen.getByText('Secure Payments')).toBeInTheDocument();
      expect(screen.getByText('No Hidden Fees')).toBeInTheDocument();
      expect(screen.getByText('100% Reliable')).toBeInTheDocument();
    });
  });
});