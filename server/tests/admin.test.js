const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');
const User = require('../models/User');
const Ride = require('../models/Ride');

describe('Admin API Endpoints', () => {
  let adminToken;
  let adminUser;
  let testRides = [];

  beforeAll(async () => {
    // Create admin user for testing
    adminUser = await User.create({
      email: 'admin@test.com',
      password: 'AdminPass123',
      role: 'admin'
    });

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/admin/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'AdminPass123'
      });

    adminToken = loginResponse.body.data.accessToken;
  });

  beforeEach(async () => {
    // Clean up rides table
    await pool.execute('DELETE FROM rides');
    testRides = [];

    // Create test rides
    const rideData = [
      {
        pickup_location: 'Test Location 1',
        destination: 'Test Destination 1',
        country_code: '+1',
        phone_number: '1234567890',
        passengers: 2,
        bags: 1,
        status: 'booked'
      },
      {
        pickup_location: 'Test Location 2',
        destination: 'Test Destination 2',
        country_code: '+44',
        phone_number: '9876543210',
        passengers: 4,
        bags: 2,
        status: 'in_progress',
        price: 25.50
      },
      {
        pickup_location: 'Test Location 3',
        destination: 'Test Destination 3',
        country_code: '+91',
        phone_number: '5555555555',
        passengers: 1,
        bags: 0,
        status: 'completed',
        price: 15.75
      }
    ];

    for (const data of rideData) {
      const ride = await Ride.create(data);
      if (data.status !== 'booked') {
        await Ride.update(ride.id, { status: data.status, price: data.price });
      }
      testRides.push(await Ride.findById(ride.id));
    }
  });

  afterAll(async () => {
    // Clean up
    await pool.execute('DELETE FROM rides');
    await pool.execute('DELETE FROM users WHERE email = ?', ['admin@test.com']);
    await pool.end();
  });

  describe('GET /api/admin/rides', () => {
    it('should get all rides with default pagination', async () => {
      const response = await request(app)
        .get('/api/admin/rides')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rides).toHaveLength(3);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    });

    it('should get rides with custom pagination', async () => {
      const response = await request(app)
        .get('/api/admin/rides?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rides).toHaveLength(2);
      expect(response.body.data.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      });
    });

    it('should filter rides by status', async () => {
      const response = await request(app)
        .get('/api/admin/rides?status=completed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rides).toHaveLength(1);
      expect(response.body.data.rides[0].status).toBe('completed');
    });

    it('should sort rides by different fields', async () => {
      const response = await request(app)
        .get('/api/admin/rides?sortBy=passengers&sortOrder=ASC')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rides[0].passengers).toBe(1);
      expect(response.body.data.rides[2].passengers).toBe(4);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/rides')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/admin/rides?page=0&limit=101&status=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/admin/rides/:id/status', () => {
    it('should update ride status successfully', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ride.status).toBe('in_progress');
      expect(response.body.message).toBe('Ride status updated successfully');
    });

    it('should return 404 for non-existent ride', async () => {
      const response = await request(app)
        .put('/api/admin/rides/99999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Ride not found');
    });

    it('should validate ride ID parameter', async () => {
      const response = await request(app)
        .put('/api/admin/rides/invalid/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'completed' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate status value', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require authentication', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/status`)
        .send({ status: 'completed' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/admin/rides/:id/price', () => {
    it('should update ride price successfully', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/price`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 30.50 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(parseFloat(response.body.data.ride.price)).toBe(30.5);
      expect(response.body.message).toBe('Ride price updated successfully');
    });

    it('should return 404 for non-existent ride', async () => {
      const response = await request(app)
        .put('/api/admin/rides/99999/price')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 25.00 })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Ride not found');
    });

    it('should validate ride ID parameter', async () => {
      const response = await request(app)
        .put('/api/admin/rides/invalid/price')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 25.00 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should validate price value', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/price`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: -10 })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require authentication', async () => {
      const rideId = testRides[0].id;
      const response = await request(app)
        .put(`/api/admin/rides/${rideId}/price`)
        .send({ price: 25.00 })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('should get analytics with default period (7days)', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBe('7days');
      expect(response.body.data.summary).toBeDefined();
      expect(typeof response.body.data.summary.total_rides).toBe('number');
      expect(typeof response.body.data.summary.completed_rides).toBe('number');
      expect(typeof response.body.data.summary.pending_rides).toBe('number');
      expect(typeof response.body.data.summary.in_progress_rides).toBe('number');
      expect(typeof response.body.data.summary.total_earnings).toBe('number');
      expect(typeof response.body.data.summary.average_price).toBe('number');
      expect(Array.isArray(response.body.data.earnings_data)).toBe(true);
    });

    it('should get analytics for different periods', async () => {
      const periods = ['7days', '1month', '6months', '1year'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/admin/analytics?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.period).toBe(period);
        expect(response.body.data.summary).toBeDefined();
        expect(response.body.data.earnings_data).toBeDefined();
      }
    });

    it('should validate period parameter', async () => {
      const response = await request(app)
        .get('/api/admin/analytics?period=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/analytics')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    it('should include date range in response', async () => {
      const response = await request(app)
        .get('/api/admin/analytics?period=1month')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startDate).toBeDefined();
      expect(response.body.data.endDate).toBeDefined();
      expect(new Date(response.body.data.startDate)).toBeInstanceOf(Date);
      expect(new Date(response.body.data.endDate)).toBeInstanceOf(Date);
    });
  });

  describe('Authorization', () => {
    it('should require admin role for all endpoints', async () => {
      // Test with invalid token
      const invalidToken = 'invalid.token.here';

      const endpoints = [
        { method: 'get', path: '/api/admin/rides' },
        { method: 'put', path: `/api/admin/rides/${testRides[0].id}/status`, body: { status: 'completed' } },
        { method: 'put', path: `/api/admin/rides/${testRides[0].id}/price`, body: { price: 25.00 } },
        { method: 'get', path: '/api/admin/analytics' }
      ];

      for (const endpoint of endpoints) {
        const req = request(app)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${invalidToken}`);
        
        if (endpoint.body) {
          req.send(endpoint.body);
        }

        const response = await req.expect(401);
        expect(response.body.success).toBe(false);
      }
    });
  });
});