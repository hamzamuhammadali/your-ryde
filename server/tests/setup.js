// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing';
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '24h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Suppress console.error during tests unless needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes && (
      args[0].includes('Authentication error:') ||
      args[0].includes('Admin login error:') ||
      args[0].includes('Token refresh error:')
    )) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});