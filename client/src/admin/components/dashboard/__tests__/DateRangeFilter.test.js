import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateRangeFilter from '../DateRangeFilter';

describe('DateRangeFilter', () => {
  const mockOnPeriodChange = jest.fn();

  beforeEach(() => {
    mockOnPeriodChange.mockClear();
  });

  it('renders all period filter buttons', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="7days" 
        onPeriodChange={mockOnPeriodChange} 
        loading={false} 
      />
    );
    
    expect(screen.getByText('Time Period:')).toBeInTheDocument();
    expect(screen.getByText('Last 7 Days')).toBeInTheDocument();
    expect(screen.getByText('Last 1 Month')).toBeInTheDocument();
    expect(screen.getByText('Last 6 Months')).toBeInTheDocument();
    expect(screen.getByText('Last 1 Year')).toBeInTheDocument();
  });

  it('highlights the selected period button', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="1month" 
        onPeriodChange={mockOnPeriodChange} 
        loading={false} 
      />
    );
    
    const selectedButton = screen.getByText('Last 1 Month');
    expect(selectedButton).toHaveClass('active');
    
    const otherButtons = [
      screen.getByText('Last 7 Days'),
      screen.getByText('Last 6 Months'),
      screen.getByText('Last 1 Year')
    ];
    
    otherButtons.forEach(button => {
      expect(button).not.toHaveClass('active');
    });
  });

  it('calls onPeriodChange when a button is clicked', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="7days" 
        onPeriodChange={mockOnPeriodChange} 
        loading={false} 
      />
    );
    
    const monthButton = screen.getByText('Last 1 Month');
    fireEvent.click(monthButton);
    
    expect(mockOnPeriodChange).toHaveBeenCalledWith('1month');
    expect(mockOnPeriodChange).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when loading is true', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="7days" 
        onPeriodChange={mockOnPeriodChange} 
        loading={true} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not call onPeriodChange when buttons are disabled', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="7days" 
        onPeriodChange={mockOnPeriodChange} 
        loading={true} 
      />
    );
    
    const monthButton = screen.getByText('Last 1 Month');
    fireEvent.click(monthButton);
    
    expect(mockOnPeriodChange).not.toHaveBeenCalled();
  });

  it('applies correct CSS classes', () => {
    render(
      <DateRangeFilter 
        selectedPeriod="6months" 
        onPeriodChange={mockOnPeriodChange} 
        loading={false} 
      />
    );
    
    expect(document.querySelector('.date-range-filter')).toBeInTheDocument();
    expect(document.querySelector('.filter-label')).toBeInTheDocument();
    expect(document.querySelector('.filter-buttons')).toBeInTheDocument();
    
    const buttons = document.querySelectorAll('.filter-button');
    expect(buttons).toHaveLength(4);
    
    // Check that the 6months button has active class
    const activeButton = screen.getByText('Last 6 Months');
    expect(activeButton).toHaveClass('filter-button', 'active');
  });

  it('handles all period values correctly', () => {
    const periods = ['7days', '1month', '6months', '1year'];
    
    periods.forEach(period => {
      const { unmount } = render(
        <DateRangeFilter 
          selectedPeriod={period} 
          onPeriodChange={mockOnPeriodChange} 
          loading={false} 
        />
      );
      
      const buttons = screen.getAllByRole('button');
      const activeButtons = buttons.filter(button => button.classList.contains('active'));
      expect(activeButtons).toHaveLength(1);
      
      unmount(); // Clean up between renders
    });
  });
});