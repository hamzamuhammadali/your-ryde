import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactInfo from '../ContactInfo';

describe('ContactInfo', () => {
  it('renders contact information title and subtitle', () => {
    render(<ContactInfo />);
    
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
    expect(screen.getByText("We're here to help! Reach out to us through any of the following channels.")).toBeInTheDocument();
  });

  it('renders all contact details', () => {
    render(<ContactInfo />);
    
    // Phone section
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-RYDE')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 123-7933')).toBeInTheDocument();
    expect(screen.getByText('Call us 24/7 for immediate assistance')).toBeInTheDocument();
    
    // Email section
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('info@ryde.com')).toBeInTheDocument();
    expect(screen.getByText('support@ryde.com')).toBeInTheDocument();
    expect(screen.getByText('Send us an email anytime')).toBeInTheDocument();
    
    // Address section
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('123 Transportation Ave')).toBeInTheDocument();
    expect(screen.getByText('City Center, State 12345')).toBeInTheDocument();
    expect(screen.getByText('Visit our main office')).toBeInTheDocument();
    
    // Hours section
    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('24/7 Service')).toBeInTheDocument();
    expect(screen.getByText('Office: Mon-Fri 9AM-6PM')).toBeInTheDocument();
    expect(screen.getByText('Always available for rides')).toBeInTheDocument();
  });

  it('renders emergency information', () => {
    render(<ContactInfo />);
    
    expect(screen.getByText('Emergency Rides')).toBeInTheDocument();
    expect(screen.getByText('+1 (555) 911-RYDE')).toBeInTheDocument();
    expect(screen.getByText('For urgent transportation needs, call our emergency line available 24/7')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<ContactInfo />);
    
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
    
    // Check for social links (they should have aria-labels)
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('renders contact icons', () => {
    render(<ContactInfo />);
    
    // Check that emoji icons are present (they should be in the DOM)
    const phoneIcon = screen.getByText('📞');
    const emailIcon = screen.getByText('📧');
    const addressIcon = screen.getByText('📍');
    const hoursIcon = screen.getByText('⏰');
    const emergencyIcon = screen.getByText('🚨');
    
    expect(phoneIcon).toBeInTheDocument();
    expect(emailIcon).toBeInTheDocument();
    expect(addressIcon).toBeInTheDocument();
    expect(hoursIcon).toBeInTheDocument();
    expect(emergencyIcon).toBeInTheDocument();
  });

  it('has proper structure for contact details', () => {
    render(<ContactInfo />);
    
    // Check that contact details are properly structured
    const contactDetails = screen.getByText('Phone').closest('.contact-detail-item');
    expect(contactDetails).toBeInTheDocument();
    expect(contactDetails).toHaveClass('contact-detail-item');
  });
});