// Test data fixtures for server-side testing

const bcrypt = require('bcryptjs');

// User fixtures
const createUserFixture = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  return {
    email: 'admin@ryde.com',
    password: hashedPassword,
    role: 'admin',
    ...overrides
  };
};

const mockUserData = {
  id: 1,
  email: 'admin@ryde.com',
  role: 'admin',
  created_at: new Date('2024-01-01T00:00:00Z'),
  updated_at: new Date('2024-01-01T00:00:00Z')
};

// Ride fixtures
const mockRideData = {
  id: 1,
  pickup_location: 'Test Pickup Location',
  destination: 'Test Destination',
  country_code: '+1',
  phone_number: '1234567890',
  passengers: 2,
  bags: 1,
  schedule_time: null,
  is_scheduled: false,
  status: 'booked',
  price: null,
  created_at: new Date('2024-01-01T10:00:00Z'),
  updated_at: new Date('2024-01-01T10:00:00Z')
};

const mockScheduledRideData = {
  ...mockRideData,
  id: 2,
  schedule_time: new Date('2024-01-02T14:30:00Z'),
  is_scheduled: true,
  status: 'in_progress',
  price: 25.50
};

const mockCompletedRideData = {
  ...mockRideData,
  id: 3,
  status: 'completed',
  price: 30.00
};

// Booking request fixtures
const mockBookingRequest = {
  pickup_location: 'Test Pickup Location',
  destination: 'Test Destination',
  country_code: '+1',
  phone_number: '1234567890',
  passengers: 2,
  bags: 1,
  is_scheduled: false,
  schedule_time: null
};

const mockScheduledBookingRequest = {
  ...mockBookingRequest,
  is_scheduled: true,
  schedule_time: '2024-01-02T14:30:00Z'
};

// Contact form fixtures
const mockContactRequest = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'This is a test message for contact form.'
};

// Authentication fixtures
const mockLoginRequest = {
  email: 'admin@ryde.com',
  password: 'password123'
};

const mockAuthResponse = {
  success: true,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  user: {
    id: 1,
    email: 'admin@ryde.com',
    role: 'admin'
  }
};

// Analytics fixtures
const mockAnalyticsData = {
  period: '7days',
  total_earnings: 155.50,
  total_rides: 15,
  completed_rides: 12,
  pending_rides: 3,
  earnings_data: [
    { date: '2024-01-01', earnings: 25.50, rides: 3 },
    { date: '2024-01-02', earnings: 30.00, rides: 2 },
    { date: '2024-01-03', earnings: 45.00, rides: 4 },
    { date: '2024-01-04', earnings: 20.00, rides: 2 },
    { date: '2024-01-05', earnings: 35.00, rides: 4 }
  ]
};

// Error fixtures
const mockValidationErrors = {
  pickup_location: 'Pickup location is required',
  destination: 'Destination is required',
  phone_number: 'Phone number is required'
};

const mockDatabaseError = {
  code: 'ER_DUP_ENTRY',
  errno: 1062,
  message: 'Duplicate entry'
};

// API Response fixtures
const mockSuccessResponse = {
  success: true,
  message: 'Operation completed successfully'
};

const mockErrorResponse = {
  success: false,
  error: 'Something went wrong'
};

// Email fixtures
const mockEmailData = {
  to: 'admin@ryde.com',
  subject: 'New Ride Booking',
  html: '<h1>New ride booking received</h1>',
  text: 'New ride booking received'
};

// WhatsApp fixtures
const mockWhatsAppData = {
  to: '+1234567890',
  message: 'Your ride has been booked successfully!'
};

// Notification fixtures
const mockNotificationData = {
  type: 'booking_confirmation',
  recipient: 'admin@ryde.com',
  data: mockRideData
};

// JWT fixtures
const mockJWTPayload = {
  userId: 1,
  email: 'admin@ryde.com',
  role: 'admin',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

// Database query fixtures
const mockQueryResult = {
  insertId: 1,
  affectedRows: 1,
  changedRows: 1,
  warningCount: 0
};

const mockSelectResult = [
  [mockRideData],
  {
    insertId: 0,
    affectedRows: 0,
    changedRows: 0,
    warningCount: 0
  }
];

// Helper functions
const createMultipleRides = (count = 5) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockRideData,
    id: index + 1,
    pickup_location: `Pickup Location ${index + 1}`,
    destination: `Destination ${index + 1}`,
    phone_number: `123456789${index}`,
    created_at: new Date(Date.now() - (index * 24 * 60 * 60 * 1000))
  }));
};

const createRideWithStatus = (status) => ({
  ...mockRideData,
  status,
  price: status === 'completed' ? 25.50 : null
});

module.exports = {
  createUserFixture,
  mockUserData,
  mockRideData,
  mockScheduledRideData,
  mockCompletedRideData,
  mockBookingRequest,
  mockScheduledBookingRequest,
  mockContactRequest,
  mockLoginRequest,
  mockAuthResponse,
  mockAnalyticsData,
  mockValidationErrors,
  mockDatabaseError,
  mockSuccessResponse,
  mockErrorResponse,
  mockEmailData,
  mockWhatsAppData,
  mockNotificationData,
  mockJWTPayload,
  mockQueryResult,
  mockSelectResult,
  createMultipleRides,
  createRideWithStatus
};