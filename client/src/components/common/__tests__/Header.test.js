import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Header', () => {
  it('renders the logo and navigation links', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Ryde')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('renders admin login link', () => {
    renderWithRouter(<Header />);
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    renderWithRouter(<Header />);
    
    const homeLink = screen.getByRole('link', { name: 'Home' });
    const aboutLink = screen.getByRole('link', { name: 'About' });
    const contactLink = screen.getByRole('link', { name: 'Contact' });
    const adminLink = screen.getByRole('link', { name: 'Admin Login' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(contactLink).toHaveAttribute('href', '/contact');
    expect(adminLink).toHaveAttribute('href', '/admin/login');
  });

  it('applies correct CSS classes', () => {
    renderWithRouter(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('header');
  });
});