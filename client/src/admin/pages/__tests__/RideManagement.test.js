import React from 'react';
import { render, screen } from '@testing-library/react';
import RideManagement from '../RideManagement';

// Mock the RideTable component
jest.mock('../../components/rides/RideTable', () => {
  return function MockRideTable() {
    return <div data-testid="ride-table">Ride Table</div>;
  };
});

describe('RideManagement', () => {
  it('renders the page title', () => {
    render(<RideManagement />);
    
    expect(screen.getByText('Ride Management')).toBeInTheDocument();
  });

  it('renders the RideTable component', () => {
    render(<RideManagement />);
    
    expect(screen.getByTestId('ride-table')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<RideManagement />);
    
    const managementPage = container.querySelector('.ride-management');
    expect(managementPage).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<RideManagement />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });
});