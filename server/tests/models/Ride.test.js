const Ride = require('../../models/Ride');

// Mock the database connection for testing
jest.mock('../../config/database', () => ({
  dbConfig: {
    host: 'localhost',
    user: 'test',
    password: 'test',
    database: 'ryde_test'
  }
}));

// Mock mysql2/promise
const mockConnection = {
  execute: jest.fn(),
  end: jest.fn()
};

jest.mock('mysql2/promise', () => ({
  createConnection: jest.fn(() => Promise.resolve(mockConnection))
}));

describe('Ride Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a new ride successfully', async () => {
      const rideData = {
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: 1,
        is_scheduled: false
      };

      // Mock successful database insertion
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await Ride.create(rideData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        ...rideData,
        status: 'booked',
        price: null,
        schedule_time: null
      });
    });

    it('creates a scheduled ride successfully', async () => {
      const scheduleTime = new Date('2024-01-02T14:30:00Z');
      const rideData = {
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: 1,
        is_scheduled: true,
        schedule_time: scheduleTime
      };

      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await Ride.create(rideData);

      expect(result.success).toBe(true);
      expect(result.data.is_scheduled).toBe(true);
      expect(new Date(result.data.schedule_time)).toEqual(scheduleTime);
    });

    it('validates required fields', async () => {
      const invalidRideData = {
        pickup_location: '',
        destination: '',
        phone_number: ''
      };

      const result = await Ride.create(invalidRideData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('validates passenger count range', async () => {
      const invalidRideData = {
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 10, // Invalid: > 8
        bags: 1
      };

      const result = await Ride.create(invalidRideData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('passengers');
    });

    it('validates bags count', async () => {
      const invalidRideData = {
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: -1 // Invalid: < 0
      };

      const result = await Ride.create(invalidRideData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('bags');
    });

    it('handles database errors', async () => {
      const rideData = {
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: 1,
        is_scheduled: false
      };

      // Mock database error
      mockConnection.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await Ride.create(rideData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('findById', () => {
    it('finds ride by ID successfully', async () => {
      const mockRide = {
        id: 1,
        pickup_location: 'Test Pickup',
        destination: 'Test Destination',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: 1,
        status: 'booked',
        price: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockConnection.execute.mockResolvedValueOnce([[mockRide]]);
      
      const result = await Ride.findById(1);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: mockRide.id,
        pickup_location: mockRide.pickup_location,
        destination: mockRide.destination,
        status: mockRide.status
      });
    });

    it('returns null for non-existent ride', async () => {
      mockConnection.execute.mockResolvedValueOnce([[]]);
      
      const result = await Ride.findById(999);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('handles invalid ID', async () => {
      const result = await Ride.findById('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('findAll', () => {
    it('returns all rides with pagination', async () => {
      const mockRides = [
        { id: 1, pickup_location: 'Location 1', status: 'booked' },
        { id: 2, pickup_location: 'Location 2', status: 'completed' },
        { id: 3, pickup_location: 'Location 3', status: 'in_progress' }
      ];

      // Mock count query
      mockConnection.execute
        .mockResolvedValueOnce([[{ count: 5 }]]) // Total count
        .mockResolvedValueOnce([mockRides]); // Paginated results

      const result = await Ride.findAll({ page: 1, limit: 3 });

      expect(result.success).toBe(true);
      expect(result.data.rides).toHaveLength(3);
      expect(result.data.total).toBe(5);
      expect(result.data.page).toBe(1);
      expect(result.data.totalPages).toBe(2);
    });

    it('filters rides by status', async () => {
      const mockRides = [
        { id: 1, pickup_location: 'Location 1', status: 'completed' }
      ];

      mockConnection.execute
        .mockResolvedValueOnce([[{ count: 1 }]])
        .mockResolvedValueOnce([mockRides]);

      const result = await Ride.findAll({ status: 'completed' });

      expect(result.success).toBe(true);
      expect(result.data.rides).toHaveLength(1);
      expect(result.data.rides[0].status).toBe('completed');
    });
  });

  describe('updateStatus', () => {
    it('updates ride status successfully', async () => {
      const mockRide = {
        id: 1,
        status: 'in_progress',
        updated_at: new Date()
      };

      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockConnection.execute.mockResolvedValueOnce([[mockRide]]);
      
      const result = await Ride.updateStatus(1, 'in_progress');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('in_progress');
    });

    it('validates status values', async () => {
      const result = await Ride.updateStatus(1, 'invalid_status');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status');
    });

    it('handles non-existent ride', async () => {
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const result = await Ride.updateStatus(999, 'completed');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('updatePrice', () => {
    it('updates ride price successfully', async () => {
      const mockRide = {
        id: 1,
        price: 25.50,
        updated_at: new Date()
      };

      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      mockConnection.execute.mockResolvedValueOnce([[mockRide]]);
      
      const result = await Ride.updatePrice(1, 25.50);

      expect(result.success).toBe(true);
      expect(result.data.price).toBe(25.50);
    });

    it('validates price values', async () => {
      const result = await Ride.updatePrice(1, -10);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price must be positive');
    });

    it('handles non-existent ride', async () => {
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const result = await Ride.updatePrice(999, 25.50);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('getAnalytics', () => {
    it('calculates analytics for 7 days period', async () => {
      const mockAnalytics = {
        total_earnings: 155.50,
        total_rides: 15,
        completed_rides: 12,
        pending_rides: 3
      };

      const mockEarningsData = [
        { date: '2024-01-01', earnings: 25.50, rides: 3 },
        { date: '2024-01-02', earnings: 30.00, rides: 2 }
      ];

      mockConnection.execute
        .mockResolvedValueOnce([[mockAnalytics]])
        .mockResolvedValueOnce([mockEarningsData]);

      const result = await Ride.getAnalytics('7days');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        period: '7days',
        total_earnings: expect.any(Number),
        total_rides: expect.any(Number),
        completed_rides: expect.any(Number),
        pending_rides: expect.any(Number)
      });
      expect(result.data.earnings_data).toBeInstanceOf(Array);
    });

    it('handles invalid period', async () => {
      const result = await Ride.getAnalytics('invalid_period');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid period');
    });
  });

  describe('delete', () => {
    it('deletes ride successfully', async () => {
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const result = await Ride.delete(1);

      expect(result.success).toBe(true);
    });

    it('handles non-existent ride', async () => {
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const result = await Ride.delete(999);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});