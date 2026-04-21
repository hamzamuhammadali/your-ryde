import React from 'react';
import { render, screen } from '@testing-library/react';
import Contact from '../Contact';

// Mock the contact components
jest.mock('../../components/contact/ContactInfo', () => {
  return function MockContactInfo() {
    return <div data-testid="contact-info">Contact Info</div>;
  };
});

jest.mock('../../components/contact/ContactForm', () => {
  return function MockContactForm() {
    return <div data-testid="contact-form">Contact Form</div>;
  };
});

describe('Contact Page', () => {
  it('renders the main title and subtitle', () => {
    render(<Contact />);
    
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Get in touch with us for any inquiries or support')).toBeInTheDocument();
  });

  it('renders ContactInfo and ContactForm components', () => {
    render(<Contact />);
    
    expect(screen.getByTestId('contact-info')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders additional info cards', () => {
    render(<Contact />);
    
    expect(screen.getByText('Quick Response')).toBeInTheDocument();
    expect(screen.getByText('24/7 Support')).toBeInTheDocument();
    expect(screen.getByText('Multiple Channels')).toBeInTheDocument();
  });

  it('renders info card links with correct hrefs', () => {
    render(<Contact />);
    
    const emailLink = screen.getByRole('link', { name: /info@ryde.com/ });
    const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/ });
    
    expect(emailLink).toHaveAttribute('href', 'mailto:info@ryde.com');
    expect(phoneLink).toHaveAttribute('href', 'tel:+15551234567');
  });

  it('renders info card icons', () => {
    render(<Contact />);
    
    // Check for emoji icons in the info cards
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🕒')).toBeInTheDocument();
    expect(screen.getByText('📞')).toBeInTheDocument();
  });

  it('has proper CSS classes for styling', () => {
    const { container } = render(<Contact />);
    
    const contactPage = container.querySelector('.contact-page');
    expect(contactPage).toBeInTheDocument();
  });

  it('renders contact grid layout', () => {
    const { container } = render(<Contact />);
    
    const contactGrid = container.querySelector('.contact-grid');
    expect(contactGrid).toBeInTheDocument();
  });
});