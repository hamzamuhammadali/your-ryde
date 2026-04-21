// Test data fixtures for consistent testing

export const mockRideData = {
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
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z'
};

export const mockScheduledRideData = {
  ...mockRideData,
  id: 2,
  schedule_time: '2024-01-02T14:30:00Z',
  is_scheduled: true,
  status: 'in_progress',
  price: 25.50
};

export const mockCompletedRideData = {
  ...mockRideData,
  id: 3,
  status: 'completed',
  price: 30.00
};

export const mockRidesList = [
  mockRideData,
  mockScheduledRideData,
  mockCompletedRideData
];

export const mockAnalyticsData = {
  period: '7days',
  total_earnings: 155.50,
  total_rides: 15,
  completed_rides: 12,
  pending_rides: 3,
  earnings_data: [
    { date: '2024-01-01', earnings: 25.50 },
    { date: '2024-01-02', earnings: 30.00 },
    { date: '2024-01-03', earnings: 45.00 },
    { date: '2024-01-04', earnings: 20.00 },
    { date: '2024-01-05', earnings: 35.00 }
  ]
};

export const mockBookingFormData = {
  pickup_location: 'Test Pickup',
  destination: 'Test Destination',
  country_code: '+1',
  phone_number: '1234567890',
  passengers: 2,
  bags: 1,
  is_scheduled: false,
  schedule_time: null
};

export const mockScheduledBookingFormData = {
  ...mockBookingFormData,
  is_scheduled: true,
  schedule_time: '2024-01-02T14:30'
};

export const mockContactFormData = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'Test message content'
};

export const mockAdminUser = {
  id: 1,
  email: 'admin@ryde.com',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z'
};

export const mockAuthResponse = {
  success: true,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  user: mockAdminUser
};

export const mockGeolocationPosition = {
  coords: {
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 10
  },
  timestamp: Date.now()
};

export const mockGeolocationError = {
  code: 1,
  message: 'User denied the request for Geolocation.'
};

// API Response fixtures
export const mockApiResponse = {
  success: true,
  data: null,
  message: 'Operation successful'
};

export const mockApiErrorResponse = {
  success: false,
  error: 'Something went wrong',
  message: 'Operation failed'
};

export const mockValidationErrors = {
  pickup_location: 'Pickup location is required',
  destination: 'Destination is required',
  phone_number: 'Phone number is required'
};