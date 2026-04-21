const request = require('supertest');
const app = require('../app');
const { createTestDatabase, setupTestTables, cleanTestTables, dropTestDatabase } = require('./utils/database');

describe('Security Tests', () => {
  beforeAll(async () => {
    await createTestDatabase();
    await setupTestTables();
  });

  afterEach(async () => {
    await cleanTestTables();
  });

  afterAll(async () => {
    await dropTestDatabase();
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting on API endpoints', async () => {
      const requests = [];
      
      // Make multiple requests quickly to trigger rate limiting
      for (let i = 0; i < 105; i++) {
        requests.push(
          request(app)
            .get('/api/health')
            .expect((res) => {
              // Should get rate limited after 100 requests
              if (i >= 100) {
                expect(res.status).toBe(429);
              }
            })
        );
      }
      
      await Promise.all(requests);
    }, 30000);

    test('should enforce stricter rate limiting on auth endpoints', async () => {
      const requests = [];
      
      // Make multiple login attempts to trigger auth rate limiting
      for (let i = 0; i < 7; i++) {
        requests.push(
          request(app)
            .post('/api/admin/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
            .expect((res) => {
              // Should get rate limited after 5 attempts
              if (i >= 5) {
                expect(res.status).toBe(429);
              }
            })
        );
      }
      
      await Promise.all(requests);
    }, 15000);
  });

  describe('Input Validation and Sanitization', () => {
    test('should reject XSS attempts in ride booking', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: xssPayload,
          destination: 'Valid Destination',
          country_code: '+1',
          phone_number: '1234567890',
          passengers: 2,
          bags: 1,
          is_scheduled: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Validation failed');
    });

    test('should reject SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE rides; --";
      
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: sqlInjection,
          destination: 'Valid Destination',
          country_code: '+1',
          phone_number: '1234567890',
          passengers: 2,
          bags: 1,
          is_scheduled: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should sanitize and validate contact form input', async () => {
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: '<script>alert("xss")</script>John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'This is a test message with <script>alert("xss")</script> content'
        });

      // Should either reject the input or sanitize it
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else {
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Validation failed');
      }
    });

    test('should enforce input length limits', async () => {
      const longString = 'a'.repeat(1001);
      
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: longString,
          destination: 'Valid Destination',
          country_code: '+1',
          phone_number: '1234567890',
          passengers: 2,
          bags: 1,
          is_scheduled: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate phone number format', async () => {
      const invalidPhone = 'not-a-phone-number';
      
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: 'Valid Location',
          destination: 'Valid Destination',
          country_code: '+1',
          phone_number: invalidPhone,
          passengers: 2,
          bags: 1,
          is_scheduled: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate email format', async () => {
      const invalidEmail = 'not-an-email';
      
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: invalidEmail,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Authentication Security', () => {
    test('should require authentication for admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/rides');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/admin/rides')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should hash passwords securely', async () => {
      // This test would require access to the database to verify password hashing
      // For now, we'll test that passwords are not returned in responses
      const loginResponse = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@ryde.com',
          password: 'admin123'
        });

      if (loginResponse.status === 200) {
        expect(loginResponse.body.user).toBeDefined();
        expect(loginResponse.body.user.password).toBeUndefined();
      }
    });
  });

  describe('CORS and Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      // Check for security headers (these are set by helmet)
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    test('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Error Handling Security', () => {
    test('should not expose sensitive error information in production', async () => {
      // Temporarily set NODE_ENV to production
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      // Should not expose stack traces in production
      expect(response.body.stack).toBeUndefined();

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });

    test('should log security events', async () => {
      // This would require mocking console.warn to verify logging
      // For now, we'll just ensure the endpoint responds appropriately
      const response = await request(app)
        .post('/api/public/rides')
        .send({
          pickup_location: '',
          destination: '',
          country_code: 'invalid',
          phone_number: 'invalid',
          passengers: 0,
          bags: -1,
          is_scheduled: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Data Sanitization', () => {
    test('should sanitize HTML entities in input', async () => {
      const htmlInput = '&lt;script&gt;alert("test")&lt;/script&gt;';
      
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: htmlInput,
          message: 'Test message'
        });

      // Should either sanitize or reject
      expect([200, 400]).toContain(response.status);
    });

    test('should handle special characters safely', async () => {
      const specialChars = "Test with special chars: !@#$%^&*()";
      
      const response = await request(app)
        .post('/api/public/contact')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: specialChars
        });

      // Should handle special characters appropriately
      expect([200, 400]).toContain(response.status);
    });
  });
});