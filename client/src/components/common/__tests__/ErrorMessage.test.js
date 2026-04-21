import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with error icon', () => {
    render(<ErrorMessage message="Error occurred" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ErrorMessage message="Test error" />);
    
    const errorDiv = container.querySelector('.error-message');
    expect(errorDiv).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<ErrorMessage message="Accessibility test" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<ErrorMessage message="Custom error" className="custom-error" />);
    
    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveClass('custom-error');
  });

  it('does not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('does not render when message is null', () => {
    const { container } = render(<ErrorMessage message={null} />);
    
    expect(container.firstChild).toBeNull();
  });
});