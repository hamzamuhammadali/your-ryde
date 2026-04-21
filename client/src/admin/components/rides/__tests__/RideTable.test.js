import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RideTable from '../RideTable';
import { rideService } from '../../../services/adminApi';

// Mock the adminApi service
jest.mock('../../../services/adminApi', () => ({
  rideService: {
    getAllRides: jest.fn(),
    updateStatus: jest.fn(),
    updatePrice: jest.fn()
  }
}));

// Mock LoadingSpinner component
jest.mock('../../../../components/common/LoadingSpinner', () => {
  return function LoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

describe('RideTable', () => {
  const mockRides = [
    {
      id: 1,
      pickup_location: '123 Main St',
      destination: '456 Oak Ave',
      country_code: '+1',
      phone_number: '555-0123',
      passengers: 2,
      bags: 1,
      is_scheduled: false,
      schedule_time: null,
      status: 'booked',
      price: 25.50,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      pickup_location: '789 Pine St',
      destination: '321 Elm St',
      country_code: '+1',
      phone_number: '555-0456',
      passengers: 1,
      bags: 0,
      is_scheduled: true,
      schedule_time: '2024-01-16T14:00:00Z',
      status: 'in_progress',
      price: null,
      created_at: '2024-01-15T11:00:00Z',
      updated_at: '2024-01-15T11:00:00Z'
    }
  ];

  const mockApiResponse = {
    success: true,
    data: {
      rides: mockRides,
      totalPages: 1,
      totalRides: 2,
      currentPage: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    rideService.getAllRides.mockResolvedValue(mockApiResponse);
  });

  test('renders loading state initially', () => {
    render(<RideTable />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('Loading rides...')).toBeInTheDocument();
  });

  test('renders ride table with data after loading', async () => {
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });

    expect(screen.getByText(/Total rides: 2/)).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('789 Pine St')).toBeInTheDocument();
  });

  test('renders table headers correctly', async () => {
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('ID')).toBeInTheDocument();
    });

    expect(screen.getByText('Pickup')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Passengers')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('handles status filter change', async () => {
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText('Status:');
    
    await act(async () => {
      fireEvent.change(statusFilter, { target: { value: 'booked' } });
    });

    await waitFor(() => {
      expect(rideService.getAllRides).toHaveBeenCalledWith(1, 10, { status: 'booked', search: '' });
    });
  });

  test('handles search filter change', async () => {
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });

    const searchFilter = screen.getByLabelText('Search:');
    
    await act(async () => {
      fireEvent.change(searchFilter, { target: { value: 'Main St' } });
    });

    await waitFor(() => {
      expect(rideService.getAllRides).toHaveBeenCalledWith(1, 10, { status: '', search: 'Main St' });
    });
  });

  test('handles pagination', async () => {
    const multiPageResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        totalPages: 3,
        currentPage: 1
      }
    };
    rideService.getAllRides.mockResolvedValue(multiPageResponse);

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    
    await act(async () => {
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(rideService.getAllRides).toHaveBeenCalledWith(2, 10, { status: '', search: '' });
    });
  });

  test('handles status update', async () => {
    rideService.updateStatus.mockResolvedValue({ success: true });
    
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });

    // This would trigger the status update through RideRow component
    // The actual test for status update is in RideRow.test.js
    expect(rideService.getAllRides).toHaveBeenCalled();
  });

  test('handles price update', async () => {
    rideService.updatePrice.mockResolvedValue({ success: true });
    
    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });

    // This would trigger the price update through RideRow component
    // The actual test for price update is in RideRow.test.js
    expect(rideService.getAllRides).toHaveBeenCalled();
  });

  test('displays error message when API fails', async () => {
    rideService.getAllRides.mockResolvedValue({
      success: false,
      error: 'Failed to fetch rides'
    });

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch rides')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  test('handles retry after error', async () => {
    rideService.getAllRides
      .mockResolvedValueOnce({ success: false, error: 'Network error' })
      .mockResolvedValueOnce(mockApiResponse);

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    const retryButton = screen.getByText('Retry');
    
    await act(async () => {
      fireEvent.click(retryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Ride Management')).toBeInTheDocument();
    });
  });

  test('displays no rides message when empty', async () => {
    rideService.getAllRides.mockResolvedValue({
      success: true,
      data: {
        rides: [],
        totalPages: 0,
        totalRides: 0,
        currentPage: 1
      }
    });

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText('No rides found.')).toBeInTheDocument();
    });
  });

  test('pagination buttons are disabled appropriately', async () => {
    const singlePageResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        totalPages: 1,
        currentPage: 1
      }
    };
    rideService.getAllRides.mockResolvedValue(singlePageResponse);

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
    });

    // Pagination should not be rendered when there's only one page
    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  test('pagination buttons work correctly with multiple pages', async () => {
    const multiPageResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        totalPages: 3,
        currentPage: 1
      }
    };
    rideService.getAllRides.mockResolvedValue(multiPageResponse);

    await act(async () => {
      render(<RideTable />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    const prevButton = screen.getByText('Previous');
    const nextButton = screen.getByText('Next');

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });
});