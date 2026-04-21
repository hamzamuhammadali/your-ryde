import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RideRow from '../RideRow';

describe('RideRow', () => {
  const mockRide = {
    id: 1,
    pickup_location: '123 Main Street, Downtown',
    destination: '456 Oak Avenue, Uptown',
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
  };

  const mockScheduledRide = {
    ...mockRide,
    id: 2,
    is_scheduled: true,
    schedule_time: '2024-01-16T14:00:00Z',
    status: 'in_progress',
    price: null
  };

  const mockOnStatusUpdate = jest.fn();
  const mockOnPriceUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders ride information correctly', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('123 Main Street, Downtown')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Avenue, Uptown')).toBeInTheDocument();
    expect(screen.getByText('+1 555-0123')).toBeInTheDocument();
    expect(screen.getByText('2 people')).toBeInTheDocument();
    expect(screen.getByText('1 bag')).toBeInTheDocument();
    expect(screen.getByText('Immediate')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  test('renders scheduled ride information correctly', () => {
    render(
      <RideRow
        ride={mockScheduledRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    expect(screen.getByText('Scheduled:')).toBeInTheDocument();
    expect(screen.getByText('Not set')).toBeInTheDocument(); // No price set
  });

  test('truncates long text appropriately', () => {
    const longLocationRide = {
      ...mockRide,
      pickup_location: 'This is a very long pickup location address that should be truncated',
      destination: 'This is a very long destination address that should also be truncated'
    };

    render(
      <RideRow
        ride={longLocationRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    // Text should be truncated with ellipsis
    expect(screen.getByText(/This is a very long pickup loc\.\.\./)).toBeInTheDocument();
    expect(screen.getByText(/This is a very long destinatio\.\.\./)).toBeInTheDocument();
  });

  test('handles price editing', async () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    expect(priceInput).toBeInTheDocument();

    fireEvent.change(priceInput, { target: { value: '30.00' } });
    
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnPriceUpdate).toHaveBeenCalledWith(1, 30);
    });
  });

  test('handles price editing cancellation', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: '50.00' } });

    const cancelButton = screen.getByText('✕');
    fireEvent.click(cancelButton);

    // Should return to original price display
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(mockOnPriceUpdate).not.toHaveBeenCalled();
  });

  test('handles price editing with Enter key', async () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: '35.75' } });
    fireEvent.keyDown(priceInput, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnPriceUpdate).toHaveBeenCalledWith(1, 35.75);
    });
  });

  test('handles price editing with Escape key', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: '50.00' } });
    fireEvent.keyDown(priceInput, { key: 'Escape' });

    // Should return to original price display
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(mockOnPriceUpdate).not.toHaveBeenCalled();
  });

  test('validates price input', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    // Mock alert
    window.alert = jest.fn();

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: '-10' } });
    
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid price');
    expect(mockOnPriceUpdate).not.toHaveBeenCalled();
  });

  test('validates empty price input', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    // Mock alert
    window.alert = jest.fn();

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: '' } });
    
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid price');
    expect(mockOnPriceUpdate).not.toHaveBeenCalled();
  });

  test('validates non-numeric price input', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    // Mock alert
    window.alert = jest.fn();

    const editButton = screen.getByTitle('Edit price');
    fireEvent.click(editButton);

    const priceInput = screen.getByDisplayValue('25.5');
    fireEvent.change(priceInput, { target: { value: 'abc' } });
    
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    expect(window.alert).toHaveBeenCalledWith('Please enter a valid price');
    expect(mockOnPriceUpdate).not.toHaveBeenCalled();
  });

  test('formats date correctly', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    // The exact format depends on locale, but should contain date and time
    const dateElement = screen.getByText(/1\/15\/2024/);
    expect(dateElement).toBeInTheDocument();
  });

  test('formats phone number correctly', () => {
    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    expect(screen.getByText('+1 555-0123')).toBeInTheDocument();
  });

  test('displays passenger and bag information correctly', () => {
    const singlePassengerRide = {
      ...mockRide,
      passengers: 1,
      bags: 0
    };

    render(
      <RideRow
        ride={singlePassengerRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    expect(screen.getByText('1 person')).toBeInTheDocument();
    // Should not show bags info when bags = 0
    expect(screen.queryByText(/bag/)).not.toBeInTheDocument();
  });

  test('displays multiple bags correctly', () => {
    const multipleBagsRide = {
      ...mockRide,
      bags: 3
    };

    render(
      <RideRow
        ride={multipleBagsRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    expect(screen.getByText('3 bags')).toBeInTheDocument();
  });

  test('handles view button click', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <RideRow
        ride={mockRide}
        onStatusUpdate={mockOnStatusUpdate}
        onPriceUpdate={mockOnPriceUpdate}
      />
    );

    const viewButton = screen.getByTitle('View details');
    fireEvent.click(viewButton);

    expect(consoleSpy).toHaveBeenCalledWith('View ride details:', 1);
    
    consoleSpy.mockRestore();
  });

  test('shows updating state', () => {
    render(
      <div className="ride-table">
        <RideRow
          ride={mockRide}
          onStatusUpdate={mockOnStatusUpdate}
          onPriceUpdate={mockOnPriceUpdate}
        />
      </div>
    );

    const rideRow = screen.getByText('#1').closest('.ride-row');
    expect(rideRow).not.toHaveClass('updating');
  });
});