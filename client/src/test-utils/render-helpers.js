import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../admin/contexts/AuthContext';

// Custom render function with router
export const renderWithRouter = (ui, options = {}) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render function with auth context
export const renderWithAuth = (ui, options = {}) => {
  const { authValue = {}, ...renderOptions } = options;
  
  const defaultAuthValue = {
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    ...authValue
  };
  
  const Wrapper = ({ children }) => (
    <AuthProvider value={defaultAuthValue}>
      {children}
    </AuthProvider>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Custom render function with both router and auth
export const renderWithRouterAndAuth = (ui, options = {}) => {
  const { initialEntries = ['/'], authValue = {}, ...renderOptions } = options;
  
  const defaultAuthValue = {
    user: null,
    token: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
    ...authValue
  };
  
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider value={defaultAuthValue}>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Helper to create mock props
export const createMockProps = (overrides = {}) => ({
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  onError: jest.fn(),
  onSuccess: jest.fn(),
  ...overrides
});

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create mock event
export const createMockEvent = (overrides = {}) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    value: '',
    name: '',
    checked: false,
    ...overrides.target
  },
  ...overrides
});

// Helper to create mock form data
export const createMockFormData = (data = {}) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Helper to simulate user interactions
export const simulateUserInput = async (element, value) => {
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.change(element, { target: { value } });
  fireEvent.blur(element);
};

// Helper to simulate form submission
export const simulateFormSubmit = async (form) => {
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.submit(form);
};

// Helper to simulate button click
export const simulateButtonClick = async (button) => {
  const { fireEvent } = await import('@testing-library/react');
  fireEvent.click(button);
};

// Helper to check accessibility
export const checkAccessibility = async (container) => {
  const { axe, toHaveNoViolations } = await import('jest-axe');
  expect.extend(toHaveNoViolations);
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Helper to mock API responses
export const mockApiSuccess = (data) => ({
  ok: true,
  status: 200,
  json: async () => ({ success: true, data }),
  text: async () => JSON.stringify({ success: true, data })
});

export const mockApiError = (error, status = 400) => ({
  ok: false,
  status,
  json: async () => ({ success: false, error }),
  text: async () => JSON.stringify({ success: false, error })
});

// Helper to create test queries
export const createTestQueries = (screen) => ({
  getByTestId: (testId) => screen.getByTestId(testId),
  queryByTestId: (testId) => screen.queryByTestId(testId),
  findByTestId: (testId) => screen.findByTestId(testId),
  getAllByTestId: (testId) => screen.getAllByTestId(testId),
  queryAllByTestId: (testId) => screen.queryAllByTestId(testId),
  findAllByTestId: (testId) => screen.findAllByTestId(testId)
});