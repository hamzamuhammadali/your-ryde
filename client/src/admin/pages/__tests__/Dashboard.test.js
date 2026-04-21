import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../Dashboard';
import { analyticsService } from '../../services/adminApi';

// Mock the analytics service
jest.mock('../../services/adminApi', () => ({
  analyticsService: {
    getAnalytics: jest.fn()
  }
}));

// Mock the child components
jest.mock('../../components/dashboard/StatsCards', () => {
  return function MockStatsCards({ analytics, loading }) {
    return (
      <div data-testid="stats-cards">
        {loading ? 'Loading stats...' : `Stats: ${analytics?.total_earnings || 0}`}
      </div>
    );
  };
});

jest.mock('../../components/dashboard/EarningsChart', () => {
  return function MockEarningsChart({ analytics, loading, period }) {
    return (
      <div data-testid="earnings-chart">
        {loading ? 'Loading chart...' : `Chart: ${period} - ${analytics?.total_earnings || 0}`}
      </div>
    );
  };
});

jest.mock('../../components/dashboard/DateRangeFilter', () => {
  return function MockDateRangeFilter({ selectedPeriod, onPeriodChange, loading }) {
    return (
      <div data-testid="date-range-filter">
        <button 
          onClick={() => onPeriodChange('1month')}
          disabled={loading}
        >
          Change to 1 month
        </button>
        <span>Selected: {selectedPeriod}</span>
      </div>
    );
  };
});

describe('AdminDashboard', () => {
  const mockAnalyticsData = {
    total_earnings: 1500,
    total_rides: 50,
    completed_rides: 45,
    pending_rides: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard header and components', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(screen.getByText('Monitor your taxi booking business performance and analytics')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('stats-cards')).toBeInTheDocument();
      expect(screen.getByTestId('earnings-chart')).toBeInTheDocument();
      expect(screen.getByTestId('date-range-filter')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', async () => {
    analyticsService.getAnalytics.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    await act(async () => {
      render(<AdminDashboard />);
    });
    
    expect(screen.getByText('Loading stats...')).toBeInTheDocument();
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('fetches analytics data on mount', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    await waitFor(() => {
      expect(analyticsService.getAnalytics).toHaveBeenCalledWith('7days');
    });
  });

  it('updates period when date range filter changes', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Selected: 7days')).toBeInTheDocument();
    });

    // Change period
    const changeButton = screen.getByText('Change to 1 month');
    
    await act(async () => {
      fireEvent.click(changeButton);
    });
    
    await waitFor(() => {
      expect(analyticsService.getAnalytics).toHaveBeenCalledWith('1month');
      expect(screen.getByText('Selected: 1month')).toBeInTheDocument();
    });
  });

  it('displays error message when analytics fetch fails', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: false,
      error: 'Failed to fetch data'
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('handles analytics service exception', async () => {
    analyticsService.getAnalytics.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch analytics data')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    // Wait for initial load
    await waitFor(() => {
      expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(1);
    });

    // Click refresh
    const refreshButton = screen.getByText(/Refresh/);
    
    await act(async () => {
      fireEvent.click(refreshButton);
    });
    
    await waitFor(() => {
      expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(2);
    });
  });

  it('retries fetch when retry button is clicked after error', async () => {
    // First call fails
    analyticsService.getAnalytics.mockResolvedValueOnce({
      success: false,
      error: 'Network error'
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    // Second call succeeds
    analyticsService.getAnalytics.mockResolvedValueOnce({
      success: true,
      data: mockAnalyticsData
    });

    const retryButton = screen.getByText('Try Again');
    
    await act(async () => {
      fireEvent.click(retryButton);
    });
    
    await waitFor(() => {
      expect(analyticsService.getAnalytics).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });
  });

  it('passes correct props to child components', async () => {
    analyticsService.getAnalytics.mockResolvedValue({
      success: true,
      data: mockAnalyticsData
    });

    await act(async () => {
      render(<AdminDashboard />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Stats: 1500')).toBeInTheDocument();
      expect(screen.getByText('Chart: 7days - 1500')).toBeInTheDocument();
    });
  });
});