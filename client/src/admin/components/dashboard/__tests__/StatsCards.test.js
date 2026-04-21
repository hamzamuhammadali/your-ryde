import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatsCards from '../StatsCards';

describe('StatsCards', () => {
  const mockAnalytics = {
    total_earnings: 1250.75,
    total_rides: 45,
    completed_rides: 38,
    pending_rides: 7
  };

  it('renders all stat cards with correct data', () => {
    render(<StatsCards analytics={mockAnalytics} loading={false} />);
    
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText('$1250.75')).toBeInTheDocument();
    
    expect(screen.getByText('Total Rides')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    
    expect(screen.getByText('Completed Rides')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
    
    expect(screen.getByText('Pending Rides')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading is true', () => {
    render(<StatsCards analytics={null} loading={true} />);
    
    const skeletonCards = document.querySelectorAll('.stat-card.loading');
    expect(skeletonCards).toHaveLength(4);
    
    const skeletonElements = document.querySelectorAll('.skeleton');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('displays default values when analytics is null', () => {
    render(<StatsCards analytics={null} loading={false} />);
    
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3); // total_rides, completed_rides, pending_rides
  });

  it('displays default values when analytics properties are missing', () => {
    const incompleteAnalytics = {
      total_earnings: 500
      // missing other properties
    };
    
    render(<StatsCards analytics={incompleteAnalytics} loading={false} />);
    
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
  });

  it('applies correct CSS classes for different stat types', () => {
    render(<StatsCards analytics={mockAnalytics} loading={false} />);
    
    const cards = document.querySelectorAll('.stat-card');
    expect(cards[0]).toHaveClass('green'); // Total Earnings
    expect(cards[1]).toHaveClass('blue'); // Total Rides
    expect(cards[2]).toHaveClass('success'); // Completed Rides
    expect(cards[3]).toHaveClass('warning'); // Pending Rides
  });

  it('displays correct icons for each stat', () => {
    render(<StatsCards analytics={mockAnalytics} loading={false} />);
    
    expect(screen.getByText('💰')).toBeInTheDocument(); // Total Earnings
    expect(screen.getByText('🚗')).toBeInTheDocument(); // Total Rides
    expect(screen.getByText('✅')).toBeInTheDocument(); // Completed Rides
    expect(screen.getByText('⏳')).toBeInTheDocument(); // Pending Rides
  });

  it('formats earnings correctly with two decimal places', () => {
    const analyticsWithDecimals = {
      ...mockAnalytics,
      total_earnings: 1234.5
    };
    
    render(<StatsCards analytics={analyticsWithDecimals} loading={false} />);
    
    expect(screen.getByText('$1234.50')).toBeInTheDocument();
  });
});