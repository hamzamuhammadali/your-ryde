import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Ryde. All rights reserved.`)).toBeInTheDocument();
  });

  it('renders company tagline', () => {
    render(<Footer />);
    
    expect(screen.getByText('Your reliable ride, anytime, anywhere.')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('footer');
  });
});