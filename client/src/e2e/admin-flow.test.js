/**
 * End-to-End Tests for Admin Flow
 * Tests the complete admin authentication and dashboard functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { setupFetchMock, mockApiSuccess, mockApiError } from '../test-utils/mocks';
import { mockAuthResponse, mockAnalyticsData, mockRidesList } from '../test-utils/fixtures';

// Setup fetch mock for all tests
beforeAll(() => {
  setupFetchMock();
});

beforeEach(() => {
  fetch.mockClear();
  // Clear localStorage before each test
  localStorage.clear();
});

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('End-to-End: Admin Authentication Flow', () => {
  it('completes admin login flow successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful login response
    fetch.mockResolvedValueOnce(mockApiSuccess(mockAuthResponse));
    
    renderApp();
    
    // Navigate to admin login
    const adminLink = screen.getByRole('link', { name: /admin login/i });
    await user.click(adminLink);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
    
    // Fill out login form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'admin@ryde.com');
    await user.type(passwordInput, 'password123');
    
    // Submit login form
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    // Should redirect to dashboard after successful login
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
    
    // Verify login API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('handles login validation errors', async () => {
    const user = userEvent.setup();
    
    renderApp();
    
    // Navigate to admin login
    const adminLink = screen.getByRole('link', { name: /admin login/i });
    await user.click(adminLink);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
    
    // Try to submit empty form
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Login API should not be called
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles login authentication errors', async () => {
    const user = userEvent.setup();
    
    // Mock authentication error
    fetch.mockResolvedValueOnce(mockApiError('Invalid credentials', 401));
    
    renderApp();
    
    // Navigate to admin login
    const adminLink = screen.getByRole('link', { name: /admin login/i });
    await user.click(adminLink);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
    
    // Fill out login form with invalid credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'wrong@email.com');
    await user.type(passwordInput, 'wrongpassword');
    
    // Submit login form
    const loginButton = screen.getByRole('button', { name: /login/i });
    await user.click(loginButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    
    // Should remain on login page
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });
});

describe('End-to-End: Admin Dashboard Flow', () => {
  beforeEach(() => {
    // Mock authenticated state
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));
  });

  it('displays dashboard analytics correctly', async () => {
    // Mock analytics API response
    fetch.mockResolvedValueOnce(mockApiSuccess(mockAnalyticsData));
    
    renderApp();
    
    // Navigate directly to dashboard (simulating authenticated user)
    window.history.pushState({}, 'Dashboard', '/admin/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
    
    // Should display analytics data
    await waitFor(() => {
      expect(screen.getByText('$155.50')).toBeInTheDocument(); // Total earnings
      expect(screen.getByText('15')).toBeInTheDocument(); // Total rides
      expect(screen.getByText('12')).toBeInTheDocument(); // Completed rides
    });
    
    // Verify analytics API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/analytics'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        })
      })
    );
  });

  it('navigates between admin sections', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce(mockApiSuccess(mockAnalyticsData)) // Dashboard
      .mockResolvedValueOnce(mockApiSuccess({ rides: mockRidesList, total: 3 })); // Rides
    
    renderApp();
    
    // Start at dashboard
    window.history.pushState({}, 'Dashboard', '/admin/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
    
    // Navigate to ride management
    const rideManagementLink = screen.getByRole('link', { name: /ride management/i });
    await user.click(rideManagementLink);
    
    await waitFor(() => {
      expect(screen.getByText(/ride management/i)).toBeInTheDocument();
    });
    
    // Should display rides table
    await waitFor(() => {
      expect(screen.getByText('Test Pickup Location')).toBeInTheDocument();
    });
  });
});

describe('End-to-End: Ride Management Flow', () => {
  beforeEach(() => {
    // Mock authenticated state
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));
  });

  it('updates ride status successfully', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce(mockApiSuccess({ rides: mockRidesList, total: 3 })) // Get rides
      .mockResolvedValueOnce(mockApiSuccess({ message: 'Status updated' })); // Update status
    
    renderApp();
    
    // Navigate to ride management
    window.history.pushState({}, 'Ride Management', '/admin/rides');
    
    await waitFor(() => {
      expect(screen.getByText(/ride management/i)).toBeInTheDocument();
    });
    
    // Wait for rides to load
    await waitFor(() => {
      expect(screen.getByText('Test Pickup Location')).toBeInTheDocument();
    });
    
    // Find and update ride status
    const statusDropdown = screen.getAllByRole('combobox')[0]; // First ride's status dropdown
    await user.selectOptions(statusDropdown, 'in_progress');
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/status updated successfully/i)).toBeInTheDocument();
    });
    
    // Verify update API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/rides/1/status'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        })
      })
    );
  });

  it('updates ride price successfully', async () => {
    const user = userEvent.setup();
    
    // Mock API responses
    fetch
      .mockResolvedValueOnce(mockApiSuccess({ rides: mockRidesList, total: 3 })) // Get rides
      .mockResolvedValueOnce(mockApiSuccess({ message: 'Price updated' })); // Update price
    
    renderApp();
    
    // Navigate to ride management
    window.history.pushState({}, 'Ride Management', '/admin/rides');
    
    await waitFor(() => {
      expect(screen.getByText(/ride management/i)).toBeInTheDocument();
    });
    
    // Wait for rides to load
    await waitFor(() => {
      expect(screen.getByText('Test Pickup Location')).toBeInTheDocument();
    });
    
    // Find and update ride price
    const priceInput = screen.getAllByRole('textbox')[0]; // First ride's price input
    await user.clear(priceInput);
    await user.type(priceInput, '25.50');
    
    // Submit price update (assuming there's a save button or blur event)
    await user.tab(); // Trigger blur event
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/price updated successfully/i)).toBeInTheDocument();
    });
    
    // Verify update API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/rides/1/price'),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-jwt-token'
        })
      })
    );
  });
});

describe('End-to-End: Admin Logout Flow', () => {
  beforeEach(() => {
    // Mock authenticated state
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));
  });

  it('logs out successfully', async () => {
    const user = userEvent.setup();
    
    renderApp();
    
    // Navigate to dashboard
    window.history.pushState({}, 'Dashboard', '/admin/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
    
    // Find and click logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);
    
    // Should redirect to login page
    await waitFor(() => {
      expect(screen.getByText('Admin Login')).toBeInTheDocument();
    });
    
    // Should clear authentication data
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});