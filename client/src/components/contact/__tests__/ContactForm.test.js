import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from '../ContactForm';
import { publicAPI } from '../../../services/api';

// Mock the API
jest.mock('../../../services/api', () => ({
  publicAPI: {
    submitContact: jest.fn()
  }
}));

// Mock the common components
jest.mock('../../common/LoadingSpinner', () => {
  return function LoadingSpinner({ size }) {
    return <div data-testid="loading-spinner" className={`loading-spinner ${size}`}>Loading...</div>;
  };
});

jest.mock('../../common/ErrorMessage', () => {
  return function ErrorMessage({ message }) {
    return <div data-testid="error-message" className="error-message">{message}</div>;
  };
});

jest.mock('../../common/SuccessMessage', () => {
  return function SuccessMessage({ message }) {
    return <div data-testid="success-message" className="success-message">{message}</div>;
  };
});

describe('ContactForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact form with all fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByText('Send us a Message')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    render(<ContactForm />);
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    render(<ContactForm />);
    
    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('shows validation error for short name', async () => {
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    await userEvent.type(nameInput, 'J');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error for short subject', async () => {
    render(<ContactForm />);
    
    const subjectInput = screen.getByLabelText(/subject/i);
    await userEvent.type(subjectInput, 'Hi');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Subject must be at least 5 characters')).toBeInTheDocument();
    });
  });

  it('shows validation error for short message', async () => {
    render(<ContactForm />);
    
    const messageInput = screen.getByLabelText(/message/i);
    await userEvent.type(messageInput, 'Short');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    publicAPI.submitContact.mockResolvedValue({
      data: { success: true }
    });
    
    render(<ContactForm />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/phone number/i), '+1234567890');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'This is a test message for the contact form.');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message! We will get back to you soon.')).toBeInTheDocument();
    });
    
    expect(publicAPI.submitContact).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      subject: 'Test Subject',
      message: 'This is a test message for the contact form.'
    });
  });

  it('submits form successfully without phone number', async () => {
    publicAPI.submitContact.mockResolvedValue({
      data: { success: true }
    });
    
    render(<ContactForm />);
    
    // Fill out the form without phone
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'This is a test message without phone.');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message! We will get back to you soon.')).toBeInTheDocument();
    });
    
    expect(publicAPI.submitContact).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      subject: 'Test Subject',
      message: 'This is a test message without phone.'
    });
  });

  it('shows error message when submission fails', async () => {
    publicAPI.submitContact.mockRejectedValue({
      response: { data: { error: 'Server error' } }
    });
    
    render(<ContactForm />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'This is a test message.');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });

  it('resets form after successful submission', async () => {
    publicAPI.submitContact.mockResolvedValue({
      data: { success: true }
    });
    
    render(<ContactForm />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageInput = screen.getByLabelText(/message/i);
    
    // Fill out the form
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(subjectInput, 'Test Subject');
    await userEvent.type(messageInput, 'This is a test message.');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message! We will get back to you soon.')).toBeInTheDocument();
    });

    // Check that form is reset
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(subjectInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });
  });

  it('shows loading state during submission', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    publicAPI.submitContact.mockReturnValue(promise);
    
    render(<ContactForm />);
    
    // Fill out the form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await userEvent.type(screen.getByLabelText(/message/i), 'This is a test message.');
    
    const submitButton = screen.getByRole('button', { name: /send message/i });
    await userEvent.click(submitButton);
    
    // Check loading state
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    
    // Resolve the promise
    resolvePromise({ data: { success: true } });
    
    await waitFor(() => {
      expect(screen.getByText('Thank you for your message! We will get back to you soon.')).toBeInTheDocument();
    });
  });
});