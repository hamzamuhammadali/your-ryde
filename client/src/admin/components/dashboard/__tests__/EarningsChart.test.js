import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EarningsChart from '../EarningsChart';

describe('EarningsChart', () => {
  const mockAnalytics = {
    earnings_data: [
      { date: '2024-01-01', earnings: 150, rides: 5 },
      { date: '2024-01-02', earnings: 200, rides: 7 },
      { date: '2024-01-03', earnings: 175, rides: 6 }
    ]
  };

  it('renders chart header and legend', () => {
    render(<EarningsChart analytics={mockAnalytics} loading={false} period="7days" />);
    
    expect(screen.getByText('Earnings Overview')).toBeInTheDocument();
    expect(screen.getByText('Earnings')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading is true', () => {
    render(<EarningsChart analytics={null} loading={true} period="7days" />);
    
    expect(screen.getByText('Earnings Overview')).toBeInTheDocument();
    
    const skeletonBars = document.querySelectorAll('.skeleton-bar');
    expect(skeletonBars.length).toBeGreaterThan(0);
  });

  it('generates sample data when analytics data is empty', () => {
    const emptyAnalytics = { earnings_data: [] };
    render(<EarningsChart analytics={emptyAnalytics} loading={false} period="7days" />);
    
    const chartBars = document.querySelectorAll('.chart-bar');
    expect(chartBars).toHaveLength(7); // 7 days of sample data
  });

  it('renders chart bars with correct data', () => {
    render(<EarningsChart analytics={mockAnalytics} loading={false} period="7days" />);
    
    const chartBars = document.querySelectorAll('.chart-bar');
    expect(chartBars).toHaveLength(3); // 3 data points
  });

  it('displays chart summary with totals', () => {
    render(<EarningsChart analytics={mockAnalytics} loading={false} period="7days" />);
    
    expect(screen.getByText('Total Earnings:')).toBeInTheDocument();
    expect(screen.getByText('Average per Day:')).toBeInTheDocument();
    
    // Total should be 150 + 200 + 175 = 525
    expect(screen.getAllByText('$525')[0]).toBeInTheDocument();
    
    // Average should be 525 / 3 = 175
    expect(screen.getAllByText('$175')[0]).toBeInTheDocument();
  });

  it('formats currency values correctly', () => {
    render(<EarningsChart analytics={mockAnalytics} loading={false} period="7days" />);
    
    // Check that currency values are formatted without decimals in the chart
    const currencyElements = document.querySelectorAll('.summary-value');
    currencyElements.forEach(element => {
      if (element.textContent.includes('$')) {
        expect(element.textContent).toMatch(/^\$\d+$/);
      }
    });
  });

  it('generates correct number of sample data points based on period', () => {
    // Test 7 days period
    const { unmount } = render(<EarningsChart analytics={{ earnings_data: [] }} loading={false} period="7days" />);
    let chartBars = document.querySelectorAll('.chart-bar');
    expect(chartBars).toHaveLength(7);
    unmount();
    
    // Re-render with 1 month period
    render(<EarningsChart analytics={{ earnings_data: [] }} loading={false} period="1month" />);
    chartBars = document.querySelectorAll('.chart-bar');
    expect(chartBars).toHaveLength(30);
  });

  it('applies correct CSS classes to chart elements', () => {
    render(<EarningsChart analytics={mockAnalytics} loading={false} period="7days" />);
    
    expect(document.querySelector('.earnings-chart')).toBeInTheDocument();
    expect(document.querySelector('.chart-container')).toBeInTheDocument();
    expect(document.querySelector('.chart-bars')).toBeInTheDocument();
    
    const chartBars = document.querySelectorAll('.chart-bar.earnings');
    expect(chartBars.length).toBeGreaterThan(0);
  });

  it('handles null analytics gracefully', () => {
    render(<EarningsChart analytics={null} loading={false} period="7days" />);
    
    // Should still render the chart structure
    expect(screen.getByText('Earnings Overview')).toBeInTheDocument();
    
    // Should generate sample data
    const chartBars = document.querySelectorAll('.chart-bar');
    expect(chartBars).toHaveLength(7);
  });
});