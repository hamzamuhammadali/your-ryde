import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../About';

describe('About Page', () => {
  it('renders the main title and subtitle', () => {
    render(<About />);
    
    expect(screen.getByText('About Ryde')).toBeInTheDocument();
    expect(screen.getByText('Your trusted partner for reliable, safe, and comfortable transportation')).toBeInTheDocument();
  });

  it('renders the company story section', () => {
    render(<About />);
    
    expect(screen.getByText('Our Story')).toBeInTheDocument();
    expect(screen.getByText(/Founded with a vision to revolutionize urban transportation/)).toBeInTheDocument();
    expect(screen.getByText(/Our commitment to quality service has made us a trusted name/)).toBeInTheDocument();
  });

  it('renders mission, values, and vision cards', () => {
    render(<About />);
    
    // Mission card
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText(/To provide safe, reliable, and affordable transportation services/)).toBeInTheDocument();
    
    // Values card
    expect(screen.getByText('Our Values')).toBeInTheDocument();
    expect(screen.getByText('Safety First')).toBeInTheDocument();
    expect(screen.getByText('Customer Satisfaction')).toBeInTheDocument();
    expect(screen.getByText('Reliability')).toBeInTheDocument();
    expect(screen.getByText('Professional Service')).toBeInTheDocument();
    expect(screen.getByText('Fair Pricing')).toBeInTheDocument();
    
    // Vision card
    expect(screen.getByText('Our Vision')).toBeInTheDocument();
    expect(screen.getByText(/To be the leading taxi service provider/)).toBeInTheDocument();
  });

  it('renders why choose us section', () => {
    render(<About />);
    
    expect(screen.getByText('Why Choose Ryde?')).toBeInTheDocument();
    
    // Feature items
    expect(screen.getByText('Safety & Security')).toBeInTheDocument();
    expect(screen.getByText('24/7 Availability')).toBeInTheDocument();
    expect(screen.getByText('Competitive Pricing')).toBeInTheDocument();
    expect(screen.getByText('Easy Booking')).toBeInTheDocument();
    expect(screen.getByText('Modern Fleet')).toBeInTheDocument();
    expect(screen.getByText('Professional Drivers')).toBeInTheDocument();
  });

  it('renders call to action section', () => {
    render(<About />);
    
    expect(screen.getByText('Ready to Experience the Ryde Difference?')).toBeInTheDocument();
    expect(screen.getByText(/Book your ride today and discover why thousands of customers trust Ryde/)).toBeInTheDocument();
    
    const bookButton = screen.getByRole('link', { name: /book your ride now/i });
    expect(bookButton).toBeInTheDocument();
    expect(bookButton).toHaveAttribute('href', '/');
  });

  it('renders feature icons', () => {
    render(<About />);
    
    // Check for emoji icons
    expect(screen.getByText('🎯')).toBeInTheDocument(); // Mission icon
    expect(screen.getByText('💎')).toBeInTheDocument(); // Values icon
    expect(screen.getByText('🌟')).toBeInTheDocument(); // Vision icon
    expect(screen.getByText('🛡️')).toBeInTheDocument(); // Safety icon
    expect(screen.getByText('⏰')).toBeInTheDocument(); // 24/7 icon
    expect(screen.getByText('💰')).toBeInTheDocument(); // Pricing icon
    expect(screen.getByText('📱')).toBeInTheDocument(); // Booking icon
    expect(screen.getAllByText('🚗')).toHaveLength(2); // Fleet icon (appears twice)
    expect(screen.getByText('👨‍💼')).toBeInTheDocument(); // Drivers icon
  });

  it('has proper CSS classes for styling', () => {
    render(<About />);
    
    const aboutPage = screen.getByText('About Ryde').closest('.about-page');
    expect(aboutPage).toBeInTheDocument();
    expect(aboutPage).toHaveClass('about-page');
  });
});