import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusDropdown from '../StatusDropdown';

describe('StatusDropdown', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with current status', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Booked')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('status-booked');
  });

  test('renders with in_progress status', () => {
    render(
      <StatusDropdown
        currentStatus="in_progress"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('status-in_progress');
  });

  test('renders with completed status', () => {
    render(
      <StatusDropdown
        currentStatus="completed"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('status-completed');
  });

  test('opens dropdown when clicked', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  test('displays all status options in dropdown', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getAllByText('Booked')).toHaveLength(2); // One in trigger, one in dropdown
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('marks current status as selected', () => {
    render(
      <StatusDropdown
        currentStatus="in_progress"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    const inProgressOption = options.find(option => 
      option.textContent.includes('In Progress')
    );

    expect(inProgressOption).toHaveClass('selected');
    expect(inProgressOption).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('calls onStatusChange when different status is selected', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    const completedOption = options.find(option => 
      option.textContent.includes('Completed')
    );

    fireEvent.click(completedOption);

    expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
  });

  test('does not call onStatusChange when same status is selected', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const options = screen.getAllByRole('option');
    const bookedOption = options.find(option => 
      option.textContent.includes('Booked')
    );

    fireEvent.click(bookedOption);

    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });

  test('closes dropdown after selection', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    const completedOption = options.find(option => 
      option.textContent.includes('Completed')
    );

    fireEvent.click(completedOption);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('closes dropdown when overlay is clicked', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const overlay = document.querySelector('.status-dropdown-overlay');
    fireEvent.click(overlay);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('handles keyboard navigation - Enter key', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('handles keyboard navigation - Space key', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: ' ' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('handles keyboard navigation - Escape key', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('handles keyboard navigation - Arrow Down key', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  test('handles keyboard navigation - Arrow Up key when open', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'ArrowUp' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('is disabled when disabled prop is true', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
    expect(trigger.closest('.status-dropdown')).toHaveClass('disabled');

    fireEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('does not respond to keyboard when disabled', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  test('has proper accessibility attributes', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-label');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('displays status indicators with correct colors', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const statusIndicators = document.querySelectorAll('.status-indicator');
    expect(statusIndicators.length).toBeGreaterThan(0);
  });

  test('rotates arrow when dropdown is open', () => {
    render(
      <StatusDropdown
        currentStatus="booked"
        onStatusChange={mockOnStatusChange}
      />
    );

    const arrow = document.querySelector('.dropdown-arrow');
    expect(arrow).not.toHaveClass('open');

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(arrow).toHaveClass('open');
  });
});