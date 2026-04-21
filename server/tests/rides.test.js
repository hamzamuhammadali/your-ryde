const request = require('supertest');
const app = require('../app');
const { pool } = require('../config/database');

describe('Ride Booking API', () => {
  beforeAll(async () => {
    // Clean up rides table before tests
    await pool.execute('DELETE FROM rides WHERE phone_number LIKE "%234567890"');
  });

  afterAll(async () => {
    // Clean up test data
    await pool.execute('DELETE FROM rides WHERE phone_number LIKE "%234567890"');
  });

  describe('POST /api/public/rides', () => {
    const validRideData = {
      pickup_location: 'Test Pickup Location',
      destination: 'Test Destination',
      country_code: '+1',
      phone_number: '1234567890',
      passengers: 2,
      bags: 1,
      is_scheduled: false
    };

    it('should create a ride booking with valid data', async () => {
      const response = await request(app)
        .post('/api/public/rides')
        .send(validRideData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Ride booking created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.pickup_location).toBe(validRideData.pickup_location);
      expect(response.body.data.destination).toBe(validRideData.destination);
      expect(response.body.data.phone_number).toBe(validRideData.phone_number);
      expect(response.body.data.passengers).toBe(validRideData.passengers);
      expect(response.body.data.bags).toBe(validRideData.bags);
      expect(response.body.data.status).toBe('booked');
      expect(response.body.data.is_scheduled).toBe(false);
    });

    it('should create a scheduled ride booking', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const scheduledRideData = {
        ...validRideData,
        phone_number: '2234567890',
        is_scheduled: true,
        schedule_time: futureDate.toISOString()
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(scheduledRideData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.is_scheduled).toBe(true);
      expect(response.body.data.schedule_time).toBeTruthy();
    });

    it('should fail with missing pickup_location', async () => {
      const invalidData = { ...validRideData };
      delete invalidData.pickup_location;

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Pickup location is required and must be between 3 and 500 characters'
          })
        ])
      );
    });

    it('should fail with missing destination', async () => {
      const invalidData = { ...validRideData };
      delete invalidData.destination;

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Destination is required and must be between 3 and 500 characters'
          })
        ])
      );
    });

    it('should fail with invalid country code', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '3234567890',
        country_code: '1' // Missing +
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Country code is required and must be in format +XXX'
          })
        ])
      );
    });

    it('should fail with invalid phone number', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '123' // Too short
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Phone number is required and must be 7-15 digits'
          })
        ])
      );
    });

    it('should fail with invalid passengers count', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '4234567890',
        passengers: 0 // Below minimum
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Passengers must be between 1 and 8'
          })
        ])
      );
    });

    it('should fail with too many passengers', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '5234567890',
        passengers: 9 // Above maximum
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Passengers must be between 1 and 8'
          })
        ])
      );
    });

    it('should fail with negative bags count', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '6234567890',
        bags: -1
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Bags must be between 0 and 10'
          })
        ])
      );
    });

    it('should fail when schedule_time is in the past', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const invalidData = {
        ...validRideData,
        phone_number: '7234567890',
        is_scheduled: true,
        schedule_time: pastDate.toISOString()
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Schedule time must be in the future'
          })
        ])
      );
    });

    it('should fail when is_scheduled is true but schedule_time is missing', async () => {
      const invalidData = {
        ...validRideData,
        phone_number: '8234567890',
        is_scheduled: true
        // schedule_time is missing
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Schedule time is required when is_scheduled is true'
          })
        ])
      );
    });

    it('should fail when schedule_time is provided but is_scheduled is false', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const invalidData = {
        ...validRideData,
        phone_number: '9234567890',
        is_scheduled: false,
        schedule_time: futureDate.toISOString()
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'is_scheduled must be true when schedule_time is provided'
          })
        ])
      );
    });

    it('should trim whitespace from string fields', async () => {
      const dataWithWhitespace = {
        ...validRideData,
        phone_number: '0234567890',
        pickup_location: '  Test Pickup Location  ',
        destination: '  Test Destination  ',
        country_code: '  +1  ',
        phone_number: '  0234567890  '
      };

      const response = await request(app)
        .post('/api/public/rides')
        .send(dataWithWhitespace)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pickup_location).toBe('Test Pickup Location');
      expect(response.body.data.destination).toBe('Test Destination');
    });
  });

  describe('GET /api/public/rides/:id', () => {
    let testRideId;

    beforeAll(async () => {
      // Create a test ride for status checking
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: 'Test Status Pickup',
          destination: 'Test Status Destination',
          country_code: '+1',
          phone_number: '1111111111',
          passengers: 1,
          bags: 0,
          is_scheduled: false
        });
      
      testRideId = response.body.data.id;
    });

    it('should get ride status with valid ID', async () => {
      const response = await request(app)
        .get(`/api/public/rides/${testRideId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testRideId);
      expect(response.body.data).toHaveProperty('status', 'booked');
      expect(response.body.data).toHaveProperty('pickup_location', 'Test Status Pickup');
      expect(response.body.data).toHaveProperty('destination', 'Test Status Destination');
      expect(response.body.data).toHaveProperty('created_at');
      
      // Should not include sensitive information like phone number
      expect(response.body.data).not.toHaveProperty('phone_number');
      expect(response.body.data).not.toHaveProperty('price');
    });

    it('should return 404 for non-existent ride ID', async () => {
      const response = await request(app)
        .get('/api/public/rides/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Ride not found');
    });

    it('should return 400 for invalid ride ID', async () => {
      const response = await request(app)
        .get('/api/public/rides/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Valid ride ID is required');
    });

    it('should return 400 for missing ride ID', async () => {
      const response = await request(app)
        .get('/api/public/rides/')
        .expect(404); // This will hit the 404 handler since the route doesn't match

      expect(response.body.success).toBe(false);
    });
  });
});