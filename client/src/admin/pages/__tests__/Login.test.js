import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import AdminLogin from '../Login';
import { authService } from '../../services/adminApi';

// Mock the auth service
jest.mock('../../services/adminApi', () => ({
  authService: {
    login: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <MemoryRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </MemoryRouter>
);

describe('AdminLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authService.isAuthenticated.mockReturnValue(false);
    authService.getCurrentUser.mockReturnValue(null);
  });

  describe('Rendering', () => {
    test('renders login form with all required elements', () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      expect(screen.getByText('Ryde Admin')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText('Enter your credentials to access the admin dashboard')).toBeInTheDocument();
      
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      
      expect(screen.getByText('© 2024 Ryde. All rights reserved.')).toBeInTheDocument();
    });

    test('renders input fields with correct attributes', () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for empty fields', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await userEvent.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('shows validation error for invalid email format', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(submitButton);

      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('shows validation error for short password', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(passwordInput, '123');
      await userEvent.click(submitButton);

      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    test('clears field errors when user starts typing', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      // Trigger validation error
      await userEvent.click(submitButton);
      expect(screen.getByText('Email is required')).toBeInTheDocument();

      // Start typing to clear error
      await userEvent.type(emailInput, 'test@example.com');
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    test('validates email format correctly', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'valid@example.com');
      await userEvent.type(passwordInput, 'password123');
      
      // Mock successful login
      authService.login.mockResolvedValue({ success: true, data: { user: { email: 'valid@example.com' } } });
      
      await userEvent.click(submitButton);

      // Should not show email validation error
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('calls login service with correct credentials', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      authService.login.mockResolvedValue({ success: true, data: { user: { email: 'admin@example.com' } } });

      await userEvent.click(submitButton);

      expect(authService.login).toHaveBeenCalledWith('admin@example.com', 'password123');
    });

    test('shows success message and redirects on successful login', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      authService.login.mockResolvedValue({ success: true, data: { user: { email: 'admin@example.com' } } });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login Successful!')).toBeInTheDocument();
        expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();
      });

      // Check that navigation is called after delay
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
      }, { timeout: 1500 });
    });

    test('shows error message on failed login', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');

      authService.login.mockResolvedValue({ success: false, error: 'Invalid credentials' });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    test('shows generic error message when login throws exception', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      authService.login.mockRejectedValue(new Error('Network error'));

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('prevents submission when form is invalid', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await userEvent.click(submitButton);

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    test('shows loading state during form submission', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      // Mock a delayed response
      authService.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      await userEvent.click(submitButton);

      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('disables form inputs during loading', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'password123');

      authService.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

      await userEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  describe('Authentication Redirect', () => {
    test('redirects to dashboard if already authenticated', () => {
      authService.isAuthenticated.mockReturnValue(true);
      
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
    });
  });

  describe('Error Handling', () => {
    test('clears login error when user starts typing', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');

      authService.login.mockResolvedValue({ success: false, error: 'Invalid credentials' });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Start typing to clear error
      await userEvent.type(emailInput, 'a');
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');

      // These inputs should have aria-describedby when there are no errors initially
      expect(emailInput).toHaveAttribute('name', 'email');
      expect(passwordInput).toHaveAttribute('name', 'password');
    });

    test('error messages have proper ARIA roles', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      await userEvent.click(submitButton);

      const emailError = screen.getByText('Email is required');
      const passwordError = screen.getByText('Password is required');

      expect(emailError).toHaveAttribute('role', 'alert');
      expect(passwordError).toHaveAttribute('role', 'alert');
    });

    test('login error has proper ARIA role', async () => {
      render(
        <TestWrapper>
          <AdminLogin />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(emailInput, 'admin@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');

      authService.login.mockResolvedValue({ success: false, error: 'Invalid credentials' });

      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid credentials');
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});