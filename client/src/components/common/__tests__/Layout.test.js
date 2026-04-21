import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Layout', () => {
  it('renders header, main content, and footer', () => {
    renderWithRouter(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );
    
    // Header should be present
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Main content should be rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    
    // Footer should be present
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const layoutDiv = container.querySelector('.layout');
    expect(layoutDiv).toBeInTheDocument();
    
    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('main-content');
  });

  it('renders children correctly', () => {
    renderWithRouter(
      <Layout>
        <h1>Custom Title</h1>
        <p>Custom paragraph</p>
      </Layout>
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom paragraph')).toBeInTheDocument();
  });
});