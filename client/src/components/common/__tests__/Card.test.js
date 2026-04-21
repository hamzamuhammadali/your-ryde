import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../Card';

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default CSS classes', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    
    const cardDiv = container.querySelector('.card');
    expect(cardDiv).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-card">
        <div>Content</div>
      </Card>
    );
    
    const cardDiv = container.querySelector('.card');
    expect(cardDiv).toHaveClass('custom-card');
  });

  it('forwards additional props', () => {
    render(
      <Card data-testid="test-card" role="article">
        <div>Content</div>
      </Card>
    );
    
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('role', 'article');
  });

  it('renders with different variants', () => {
    const { container } = render(
      <Card variant="elevated">
        <div>Content</div>
      </Card>
    );
    
    const cardDiv = container.querySelector('.card');
    expect(cardDiv).toBeInTheDocument();
  });

  it('handles click events when clickable', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick}>
        <div>Clickable content</div>
      </Card>
    );
    
    const card = screen.getByText('Clickable content').closest('.card');
    card.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});