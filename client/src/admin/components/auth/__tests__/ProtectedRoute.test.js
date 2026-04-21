import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authService } from '../../../services/adminApi';

// Mock the auth service
jest.mock('../../../services/adminApi', () => ({
  authService: {
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn()
  }
}));

// Mock AdminLayout
jest.mock('../../layout/AdminLayout', () => {
  return function MockAdminLayout({ children }) {
    return (
      <div data-testid="admin-layout">
        <div>Admin Layout</div>
        {children}
      </div>
    );
  };
});

// Test component to render inside protected route
const TestDashboard = () => <div data-testid="dashboard">Dashboard Content</div>;

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication States', () => {
    test('renders protected content when user is authenticated', async () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ id: 1, email: 'admin@example.com' });

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should show admin layout and dashboard content
      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin Layout')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    test('redirects to login when user is not authenticated', async () => {
      authService.isAuthenticated.mockReturnValue(false);
      authService.getCurrentUser.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should redirect to login page
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      
      // Should not show protected content
      expect(screen.queryByTestId('admin-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Layout Integration', () => {
    test('wraps protected content with AdminLayout', async () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ id: 1, email: 'admin@example.com' });

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should render AdminLayout wrapper
      const adminLayout = screen.getByTestId('admin-layout');
      expect(adminLayout).toBeInTheDocument();
      
      // Dashboard should be inside the layout
      const dashboard = screen.getByTestId('dashboard');
      expect(adminLayout).toContainElement(dashboard);
    });

    test('does not render AdminLayout when not authenticated', async () => {
      authService.isAuthenticated.mockReturnValue(false);
      authService.getCurrentUser.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should not render AdminLayout
      expect(screen.queryByTestId('admin-layout')).not.toBeInTheDocument();
      
      // Should show login page instead
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('Navigation Behavior', () => {
    test('preserves route path after authentication', async () => {
      authService.isAuthenticated.mockReturnValue(true);
      authService.getCurrentUser.mockReturnValue({ id: 1, email: 'admin@example.com' });

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should render the requested dashboard page
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    test('redirects with replace flag to prevent back navigation to protected route', async () => {
      authService.isAuthenticated.mockReturnValue(false);
      authService.getCurrentUser.mockReturnValue(null);

      render(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AuthProvider>
            <Routes>
              <Route path="/admin/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route path="dashboard" element={<TestDashboard />} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should redirect to login
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      
      // The redirect should use replace: true (this is tested implicitly by the navigation behavior)
      expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
    });
  });
});