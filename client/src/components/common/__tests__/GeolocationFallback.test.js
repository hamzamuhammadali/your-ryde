import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GeolocationFallback from '../GeolocationFallback';
import { GEOLOCATION_ERRORS } from '../../../services/geolocation';

describe('GeolocationFallback', () => {
  const mockProps = {
    onRetry: jest.fn(),
    onManualInput: jest.fn(),
    onDismiss: jest.fn(),
    isRetrying: false,
    showManualInput: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message and suggestions', () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    expect(screen.getByText('Location Access Issue')).toBeInTheDocument();
    expect(screen.getByText(/Location access denied/)).toBeInTheDocument();
    expect(screen.getByText(/Click the location icon in your browser's address bar/)).toBeInTheDocument();
  });

  it('shows retry button for retryable errors', () => {
    const error = new Error(GEOLOCATION_ERRORS.TIMEOUT);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('hides retry button for non-retryable errors', () => {
    const error = new Error(GEOLOCATION_ERRORS.NOT_SUPPORTED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const error = new Error(GEOLOCATION_ERRORS.TIMEOUT);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Try Again'));
    expect(mockProps.onRetry).toHaveBeenCalled();
  });

  it('shows manual input when enter manually button is clicked', () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Enter Manually'));
    
    expect(screen.getByPlaceholderText(/e.g., 123 Main St/)).toBeInTheDocument();
    expect(screen.getByText('Use This Location')).toBeInTheDocument();
  });

  it('calls onManualInput when manual location is submitted', async () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Enter Manually'));
    
    const input = screen.getByPlaceholderText(/e.g., 123 Main St/);
    fireEvent.change(input, { target: { value: '123 Main Street' } });
    
    fireEvent.click(screen.getByText('Use This Location'));
    
    expect(mockProps.onManualInput).toHaveBeenCalledWith('123 Main Street');
  });

  it('submits manual input on Enter key press', async () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Enter Manually'));
    
    const input = screen.getByPlaceholderText(/e.g., 123 Main St/);
    fireEvent.change(input, { target: { value: '123 Main Street' } });
    
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockProps.onManualInput).toHaveBeenCalledWith('123 Main Street');
  });

  it('disables use location button when input is empty', () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Enter Manually'));
    
    const button = screen.getByText('Use This Location');
    expect(button).toBeDisabled();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} />);

    fireEvent.click(screen.getByText('Dismiss'));
    expect(mockProps.onDismiss).toHaveBeenCalled();
  });

  it('shows retrying state when isRetrying is true', () => {
    const error = new Error(GEOLOCATION_ERRORS.TIMEOUT);
    
    render(<GeolocationFallback {...mockProps} error={error} isRetrying={true} />);

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('hides manual input when showManualInput is false', () => {
    const error = new Error(GEOLOCATION_ERRORS.PERMISSION_DENIED);
    
    render(<GeolocationFallback {...mockProps} error={error} showManualInput={false} />);

    expect(screen.queryByText('Enter Manually')).not.toBeInTheDocument();
  });

  it('displays appropriate suggestions for different error types', () => {
    const { rerender } = render(
      <GeolocationFallback {...mockProps} error={new Error(GEOLOCATION_ERRORS.POSITION_UNAVAILABLE)} />
    );

    expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();

    rerender(
      <GeolocationFallback {...mockProps} error={new Error(GEOLOCATION_ERRORS.NOT_SUPPORTED)} />
    );

    expect(screen.getByText(/Update your browser to the latest version/)).toBeInTheDocument();
  });
});