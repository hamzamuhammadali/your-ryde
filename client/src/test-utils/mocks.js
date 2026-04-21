// Mock utilities for testing

// Mock geolocation API
export const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

export const setupGeolocationMock = (supported = true) => {
  if (supported) {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });
  } else {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true
    });
  }
};

// Mock fetch API
export const mockFetch = jest.fn();

export const setupFetchMock = () => {
  global.fetch = mockFetch;
};

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

export const setupLocalStorageMock = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
};

// Mock sessionStorage
export const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

export const setupSessionStorageMock = () => {
  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
  });
};

// Mock window.location
export const mockLocation = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

export const setupLocationMock = () => {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true
  });
};

// Mock console methods
export const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

export const setupConsoleMock = () => {
  global.console = {
    ...console,
    ...mockConsole
  };
};

// Mock Date for consistent testing
export const mockDate = (dateString) => {
  const MockedDate = class extends Date {
    constructor(...args) {
      if (args.length === 0) {
        super(dateString);
      } else {
        super(...args);
      }
    }
  };
  
  MockedDate.now = () => new Date(dateString).getTime();
  
  global.Date = MockedDate;
};

// Mock timers
export const setupTimerMocks = () => {
  jest.useFakeTimers();
};

export const cleanupTimerMocks = () => {
  jest.useRealTimers();
};

// Mock IntersectionObserver
export const mockIntersectionObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
};

export const setupIntersectionObserverMock = () => {
  global.IntersectionObserver = jest.fn().mockImplementation(() => mockIntersectionObserver);
};

// Mock ResizeObserver
export const mockResizeObserver = {
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
};

export const setupResizeObserverMock = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => mockResizeObserver);
};

// Mock matchMedia
export const setupMatchMediaMock = () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockGeolocation.getCurrentPosition.mockClear();
  mockGeolocation.watchPosition.mockClear();
  mockGeolocation.clearWatch.mockClear();
  mockFetch.mockClear();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockSessionStorage.removeItem.mockClear();
  mockSessionStorage.clear.mockClear();
  mockConsole.log.mockClear();
  mockConsole.error.mockClear();
  mockConsole.warn.mockClear();
  mockConsole.info.mockClear();
};