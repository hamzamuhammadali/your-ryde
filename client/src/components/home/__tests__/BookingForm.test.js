import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from '../BookingForm';
import { publicAPI } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  publicAPI: {
    createRide: jest.fn()
  }
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

describe('BookingForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    publicAPI.createRide.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders booking form with all required fields', () => {
    render(<BookingForm />);
    
    expect(screen.getByText('Book Your Ride')).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/passengers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/schedule for later/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /book ride/i })).toBeInTheDocument();
  });

  test('displays validation errors for empty required fields', async () => {
    render(<BookingForm />);
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Pickup location is required')).toBeInTheDocument();
      expect(screen.getByText('Destination is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });

  test('validates phone number format', async () => {
    render(<BookingForm />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    await userEvent.type(phoneInput, '123');
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number (7-15 digits)')).toBeInTheDocument();
    });
  });

  test('validates minimum length for pickup location and destination', async () => {
    render(<BookingForm />);
    
    const pickupInput = screen.getByLabelText(/pickup location/i);
    const destinationInput = screen.getByLabelText(/destination/i);
    
    await userEvent.type(pickupInput, 'AB');
    await userEvent.type(destinationInput, 'CD');
    
    await waitFor(() => {
      expect(screen.getByText('Pickup location must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Destination must be at least 3 characters')).toBeInTheDocument();
    });
  });

  test('shows schedule time field when "Schedule for later" is checked', async () => {
    render(<BookingForm />);
    
    const scheduleCheckbox = screen.getByLabelText(/schedule for later/i);
    await userEvent.click(scheduleCheckbox);
    
    expect(screen.getByLabelText(/schedule time/i)).toBeInTheDocument();
  });

  test('handles passenger selection correctly', async () => {
    render(<BookingForm />);
    
    const passengerSelect = screen.getByLabelText(/passengers/i);
    await userEvent.selectOptions(passengerSelect, '4');
    
    expect(passengerSelect.value).toBe('4');
  });

  test('handles bag selection correctly including 5+ option', async () => {
    render(<BookingForm />);
    
    const bagSelect = screen.getByLabelText(/bags/i);
    await userEvent.selectOptions(bagSelect, '5+');
    
    expect(bagSelect.value).toBe('5+');
  });

  test('handles country code selection', async () => {
    render(<BookingForm />);
    
    const countryCodeSelect = screen.getByDisplayValue('+1');
    await userEvent.selectOptions(countryCodeSelect, '+44');
    
    expect(countryCodeSelect.value).toBe('+44');
  });

  test('submits form with valid data', async () => {
    render(<BookingForm />);
    
    // Fill in all required fields
    await userEvent.type(screen.getByLabelText(/pickup location/i), 'Test Pickup Location');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Test Destination');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(publicAPI.createRide).toHaveBeenCalledWith({
        pickup_location: 'Test Pickup Location',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 1,
        bags: 0,
        is_scheduled: false
      });
    });
  });

  test('converts 5+ bags to number 5 in submission', async () => {
    render(<BookingForm />);
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/pickup location/i), 'Test Pickup Location');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Test Destination');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    
    // Select 5+ bags
    await userEvent.selectOptions(screen.getByLabelText(/bags/i), '5+');
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(publicAPI.createRide).toHaveBeenCalledWith(
        expect.objectContaining({
          bags: 5
        })
      );
    });
  });

  test('shows success message after successful submission', async () => {
    render(<BookingForm />);
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/pickup location/i), 'Test Pickup Location');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Test Destination');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Booking submitted successfully! You will receive a confirmation shortly.')).toBeInTheDocument();
    });
  });

  test('shows error message when submission fails', async () => {
    publicAPI.createRide.mockRejectedValue(new Error('Network error'));
    
    render(<BookingForm />);
    
    // Fill in required fields
    await userEvent.type(screen.getByLabelText(/pickup location/i), 'Test Pickup Location');
    await userEvent.type(screen.getByLabelText(/destination/i), 'Test Destination');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to submit booking. Please try again.')).toBeInTheDocument();
    });
  });

  test('resets form after successful submission', async () => {
    render(<BookingForm />);
    
    const pickupInput = screen.getByLabelText(/pickup location/i);
    const destinationInput = screen.getByLabelText(/destination/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    
    // Fill in required fields
    await userEvent.type(pickupInput, 'Test Pickup Location');
    await userEvent.type(destinationInput, 'Test Destination');
    await userEvent.type(phoneInput, '1234567890');
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(pickupInput.value).toBe('');
      expect(destinationInput.value).toBe('');
      expect(phoneInput.value).toBe('');
    });
  });

  test('disables submit button when form has validation errors', async () => {
    render(<BookingForm />);
    
    const phoneInput = screen.getByLabelText(/phone number/i);
    await userEvent.type(phoneInput, '123'); // Invalid phone number
    
    const submitButton = screen.getByRole('button', { name: /book ride/i });
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Geolocation functionality', () => {
    test('gets current location successfully', async () => {
      // Mock successful geolocation
      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        });
      });
      
      render(<BookingForm />);
      
      const locationButton = screen.getByRole('button', { name: /use current location/i });
      await userEvent.click(locationButton);
      
      await waitFor(() => {
        const pickupInput = screen.getByLabelText(/pickup location/i);
        expect(pickupInput.value).toBe('40.712800, -74.006000');
      });
    });

    test('handles unsupported geolocation', async () => {
      // Mock unsupported geolocation
      Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true
      });
      
      render(<BookingForm />);
      
      const locationButton = screen.getByRole('button', { name: /use current location/i });
      await userEvent.click(locationButton);
      
      await waitFor(() => {
        expect(screen.getByText('Geolocation is not supported by this browser')).toBeInTheDocument();
      });
    });
  });
});