/**
 * End-to-End Tests for Critical User Flows
 * These tests simulate real user interactions across the entire application
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { setupFetchMock, mockApiSuccess, mockApiError } from '../test-utils/mocks';
import { mockBookingFormData, mockApiResponse } from '../test-utils/fixtures';

// Setup fetch mock for all tests
beforeAll(() => {
  setupFetchMock();
});

beforeEach(() => {
  fetch.mockClear();
});

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('End-to-End: Booking Flow', () => {
  it('completes full booking flow successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful API response
    fetch.mockResolvedValueOnce(mockApiSuccess({
      id: 1,
      ...mockBookingFormData,
      status: 'booked'
    }));
    
    renderApp();
    
    // User should see the home page with booking form
    expect(screen.getByText('Your Reliable Ride, Anytime, Anywhere')).toBeInTheDocument();
    
    // Fill out the booking form
    const pickupInput = screen.getByLabelText(/pickup location/i);
    const destinationInput = screen.getByLabelText(/destination/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    
    await user.type(pickupInput, mockBookingFormData.pickup_location);
    await user.type(destinationInput, mockBookingFormData.destination);
    await user.type(phoneInput, mockBookingFormData.phone_number);
    
    // Select passengers and bags
    const passengersSelect = screen.getByLabelText(/passengers/i);
    const bagsSelect = screen.getByLabelText(/bags/i);
    
    await user.selectOptions(passengersSelect, mockBookingFormData.passengers.toString());
    await user.selectOptions(bagsSelect, mockBookingFormData.bags.toString());
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await user.click(submitButton);
    
    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/booking submitted successfully/i)).toBeInTheDocument();
    });
    
    // Verify API was called with correct data
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/public/rides'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.stringContaining(mockBookingFormData.pickup_location)
      })
    );
  });

  it('handles booking form validation errors', async () => {
    const user = userEvent.setup();
    
    renderApp();
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/pickup location is required/i)).toBeInTheDocument();
      expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
    });
    
    // Form should not be submitted
    expect(fetch).not.toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock API error response
    fetch.mockResolvedValueOnce(mockApiError('Server error occurred'));
    
    renderApp();
    
    // Fill out the form with valid data
    const pickupInput = screen.getByLabelText(/pickup location/i);
    const destinationInput = screen.getByLabelText(/destination/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    
    await user.type(pickupInput, mockBookingFormData.pickup_location);
    await user.type(destinationInput, mockBookingFormData.destination);
    await user.type(phoneInput, mockBookingFormData.phone_number);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to submit booking/i)).toBeInTheDocument();
    });
  });
});

describe('End-to-End: Navigation Flow', () => {
  it('navigates between pages correctly', async () => {
    const user = userEvent.setup();
    
    renderApp();
    
    // Should start on home page
    expect(screen.getByText('Your Reliable Ride, Anytime, Anywhere')).toBeInTheDocument();
    
    // Navigate to About page
    const aboutLink = screen.getByRole('link', { name: /about/i });
    await user.click(aboutLink);
    
    await waitFor(() => {
      expect(screen.getByText('About Ryde')).toBeInTheDocument();
    });
    
    // Navigate to Contact page
    const contactLink = screen.getByRole('link', { name: /contact/i });
    await user.click(contactLink);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
    
    // Navigate back to Home
    const homeLink = screen.getByRole('link', { name: /home/i });
    await user.click(homeLink);
    
    await waitFor(() => {
      expect(screen.getByText('Your Reliable Ride, Anytime, Anywhere')).toBeInTheDocument();
    });
  });
});

describe('End-to-End: Contact Form Flow', () => {
  it('submits contact form successfully', async () => {
    const user = userEvent.setup();
    
    // Mock successful contact form submission
    fetch.mockResolvedValueOnce(mockApiSuccess({ message: 'Contact form submitted' }));
    
    renderApp();
    
    // Navigate to contact page
    const contactLink = screen.getByRole('link', { name: /contact/i });
    await user.click(contactLink);
    
    await waitFor(() => {
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
    
    // Fill out contact form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(subjectInput, 'Test Subject');
    await user.type(messageInput, 'This is a test message');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await user.click(submitButton);
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
    
    // Verify API was called
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/public/contact'),
      expect.objectContaining({
        method: 'POST'
      })
    );
  });
});

describe('End-to-End: Responsive Design', () => {
  it('adapts to mobile viewport', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));
    
    renderApp();
    
    // Check that mobile-friendly elements are present
    expect(screen.getByText('Your Reliable Ride, Anytime, Anywhere')).toBeInTheDocument();
    
    // Form should still be functional on mobile
    const bookingForm = screen.getByRole('form');
    expect(bookingForm).toBeInTheDocument();
  });
});