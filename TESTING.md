# Testing Documentation

This document provides comprehensive information about the testing suite for the Ryde Taxi Booking application.

## Overview

The testing suite includes:
- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing API endpoints and database operations
- **End-to-End Tests**: Testing complete user workflows
- **Database Tests**: Testing data models and queries
- **Coverage Reports**: Measuring test coverage across the codebase

## Test Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── **/__tests__/          # Component unit tests
│   │   ├── pages/
│   │   │   └── **/__tests__/          # Page component tests
│   │   ├── services/
│   │   │   └── **/__tests__/          # Service layer tests
│   │   ├── hooks/
│   │   │   └── **/__tests__/          # Custom hooks tests
│   │   ├── e2e/                       # End-to-end tests
│   │   └── test-utils/                # Testing utilities
│   └── coverage/                      # Client coverage reports
├── server/
│   ├── tests/
│   │   ├── models/                    # Database model tests
│   │   ├── utils/                     # Test utilities
│   │   ├── *.test.js                  # API and service tests
│   │   └── setup.js                   # Test configuration
│   └── coverage/                      # Server coverage reports
└── scripts/
    └── run-all-tests.js               # Comprehensive test runner
```

## Running Tests

### Client Tests

```bash
# Run all client tests
cd client
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### Server Tests

```bash
# Run all server tests
cd server
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

### All Tests

```bash
# Run comprehensive test suite
node scripts/run-all-tests.js
```

## Test Categories

### 1. Unit Tests

#### Client-Side Components
- **Common Components**: Button, LoadingSpinner, ErrorMessage, etc.
- **Home Components**: BookingForm, HeroBanner, ServicesSection, etc.
- **Admin Components**: Dashboard, RideTable, StatusDropdown, etc.
- **Page Components**: Home, About, Contact, etc.

#### Server-Side Units
- **Controllers**: Authentication, rides, admin functionality
- **Services**: Email, WhatsApp, notifications
- **Middleware**: Authentication, validation, error handling
- **Models**: User and Ride data models

### 2. Integration Tests

#### API Endpoints
- **Public Routes**: Ride booking, contact form
- **Admin Routes**: Authentication, ride management, analytics
- **Authentication**: Login, logout, token refresh

#### Database Operations
- **CRUD Operations**: Create, read, update, delete
- **Data Validation**: Input validation and constraints
- **Relationships**: Data integrity and foreign keys

### 3. End-to-End Tests

#### Critical User Flows
- **Booking Flow**: Complete ride booking process
- **Admin Flow**: Login, dashboard navigation, ride management
- **Navigation Flow**: Page navigation and routing
- **Form Submissions**: Contact form, booking form validation

#### Cross-Browser Testing
- **Responsive Design**: Mobile and desktop layouts
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge

### 4. Database Tests

#### Model Testing
- **User Model**: Creation, authentication, validation
- **Ride Model**: CRUD operations, status updates, analytics
- **Data Integrity**: Constraints, indexes, relationships

#### Query Testing
- **Performance**: Query optimization and indexing
- **Analytics**: Earnings calculations, ride statistics
- **Pagination**: Large dataset handling

## Test Utilities

### Client Test Utilities

#### Fixtures (`client/src/test-utils/fixtures.js`)
- Mock data for rides, users, analytics
- API response fixtures
- Form data fixtures

#### Mocks (`client/src/test-utils/mocks.js`)
- Geolocation API mocking
- Fetch API mocking
- LocalStorage and SessionStorage mocking
- Browser API mocking

#### Render Helpers (`client/src/test-utils/render-helpers.js`)
- Custom render functions with providers
- Router and authentication context helpers
- Accessibility testing helpers

### Server Test Utilities

#### Database Utilities (`server/tests/utils/database.js`)
- Test database setup and teardown
- Test data insertion and cleanup
- Database connection management

#### Fixtures (`server/tests/utils/fixtures.js`)
- Mock data for all entities
- API request/response fixtures
- Authentication fixtures

## Coverage Requirements

### Client Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Server Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
- **Text**: Console output during test runs
- **LCOV**: Machine-readable format for CI/CD
- **HTML**: Interactive browser-based reports

## Test Configuration

### Jest Configuration (Client)
```json
{
  "collectCoverageFrom": [
    "src/**/*.{js,jsx}",
    "!src/index.js",
    "!src/setupTests.js",
    "!src/test-utils/**",
    "!src/**/*.test.{js,jsx}",
    "!src/**/index.js"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

### Jest Configuration (Server)
```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'routes/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: node scripts/run-all-tests.js
      - uses: codecov/codecov-action@v1
        with:
          file: ./coverage/lcov.info
```

## Best Practices

### Writing Tests
1. **Descriptive Names**: Use clear, descriptive test names
2. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Include boundary conditions and error scenarios

### Test Data Management
1. **Use Fixtures**: Consistent test data across tests
2. **Clean State**: Reset state between tests
3. **Realistic Data**: Use data that resembles production scenarios
4. **Minimal Data**: Only include necessary data for each test

### Performance Considerations
1. **Parallel Execution**: Run tests in parallel when possible
2. **Database Cleanup**: Efficient cleanup between tests
3. **Mock Heavy Operations**: Mock expensive operations like API calls
4. **Test Isolation**: Ensure tests don't depend on each other

## Debugging Tests

### Common Issues
1. **Async Operations**: Use proper async/await or waitFor
2. **DOM Queries**: Use appropriate queries (getBy, queryBy, findBy)
3. **Mock Cleanup**: Reset mocks between tests
4. **State Persistence**: Ensure clean state between tests

### Debugging Tools
1. **screen.debug()**: Print current DOM state
2. **console.log**: Debug test execution
3. **--verbose**: Detailed test output
4. **--detectOpenHandles**: Find resource leaks

## Maintenance

### Regular Tasks
1. **Update Dependencies**: Keep testing libraries current
2. **Review Coverage**: Monitor coverage trends
3. **Refactor Tests**: Keep tests maintainable
4. **Performance Monitoring**: Track test execution time

### Adding New Tests
1. **Follow Patterns**: Use existing test patterns
2. **Update Documentation**: Document new test categories
3. **Maintain Coverage**: Ensure new code is tested
4. **Review Process**: Include tests in code reviews

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)