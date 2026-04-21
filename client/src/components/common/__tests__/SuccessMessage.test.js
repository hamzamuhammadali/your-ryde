import React from 'react';
import { render, screen } from '@testing-library/react';
import SuccessMessage from '../SuccessMessage';

describe('SuccessMessage', () => {
  it('renders success message', () => {
    render(<SuccessMessage message="Operation successful" />);
    
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('renders with success icon', () => {
    render(<SuccessMessage message="Success!" />);
    
    const successContainer = screen.getByRole('status');
    expect(successContainer).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<SuccessMessage message="Test success" />);
    
    const successDiv = container.querySelector('.success-message');
    expect(successDiv).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<SuccessMessage message="Accessibility test" />);
    
    const successContainer = screen.getByRole('status');
    expect(successContainer).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<SuccessMessage message="Custom success" className="custom-success" />);
    
    const successContainer = screen.getByRole('status');
    expect(successContainer).toHaveClass('custom-success');
  });

  it('does not render when message is empty', () => {
    const { container } = render(<SuccessMessage message="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('does not render when message is null', () => {
    const { container } = render(<SuccessMessage message={null} />);
    
    expect(container.firstChild).toBeNull();
  });
});