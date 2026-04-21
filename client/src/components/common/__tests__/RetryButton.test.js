import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RetryButton from '../RetryButton';

describe('RetryButton', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders default retry message', () => {
    render(<RetryButton onRetry={mockOnRetry} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Click retry to try again.')).toBeInTheDocument();
  });

  it('renders custom message', () => {
    render(<RetryButton onRetry={mockOnRetry} message="Custom error message" />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows retry button when not retrying', () => {
    render(<RetryButton onRetry={mockOnRetry} />);

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).not.toBeDisabled();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<RetryButton onRetry={mockOnRetry} />);

    fireEvent.click(screen.getByText('Retry'));
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('shows retrying state when isRetrying is true', () => {
    render(<RetryButton onRetry={mockOnRetry} isRetrying={true} />);

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we try again...')).toBeInTheDocument();
  });

  it('shows retry count when retryCount > 0', () => {
    render(<RetryButton onRetry={mockOnRetry} retryCount={2} />);

    expect(screen.getByText('Failed after 2 attempts')).toBeInTheDocument();
  });

  it('shows retry attempt number when retrying with count', () => {
    render(<RetryButton onRetry={mockOnRetry} isRetrying={true} retryCount={1} />);

    expect(screen.getByText('Retrying... (attempt 1)')).toBeInTheDocument();
  });

  it('hides retry button when max retries reached', () => {
    render(<RetryButton onRetry={mockOnRetry} retryCount={3} maxRetries={3} />);

    expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    expect(screen.getByText('Maximum retry attempts reached. Please try again later.')).toBeInTheDocument();
  });

  it('displays error message when error is provided', () => {
    const error = new Error('Network connection failed');
    render(<RetryButton onRetry={mockOnRetry} error={error} />);

    expect(screen.getByText('Network connection failed')).toBeInTheDocument();
  });

  it('hides details when showDetails is false', () => {
    render(<RetryButton onRetry={mockOnRetry} showDetails={false} />);

    expect(screen.queryByText('Click retry to try again.')).not.toBeInTheDocument();
  });

  it('disables retry button when retrying', () => {
    render(<RetryButton onRetry={mockOnRetry} isRetrying={true} />);

    const retryButton = screen.getByRole('button', { name: /retrying/i });
    expect(retryButton).toBeDisabled();
  });

  it('shows correct icon based on state', () => {
    const { rerender } = render(<RetryButton onRetry={mockOnRetry} />);
    
    // Should show warning icon when not retrying
    expect(screen.getByText('⚠️')).toBeInTheDocument();

    // Should show retry icon when retrying
    rerender(<RetryButton onRetry={mockOnRetry} isRetrying={true} />);
    expect(screen.getByText('🔄')).toBeInTheDocument();
  });

  it('handles singular vs plural retry attempts correctly', () => {
    const { rerender } = render(<RetryButton onRetry={mockOnRetry} retryCount={1} />);
    
    expect(screen.getByText('Failed after 1 attempt')).toBeInTheDocument();

    rerender(<RetryButton onRetry={mockOnRetry} retryCount={2} />);
    expect(screen.getByText('Failed after 2 attempts')).toBeInTheDocument();
  });
});