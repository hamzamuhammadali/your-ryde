const request = require('supertest');
const app = require('../app');

describe('Contact API', () => {
  describe('POST /api/public/contact', () => {
    it('should submit contact form successfully with valid data', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        subject: 'Test Subject',
        message: 'This is a test message for the contact form.'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Contact form submitted successfully');
    });

    it('should submit contact form successfully without phone number', async () => {
      const contactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'Test Subject Without Phone',
        message: 'This is a test message without phone number.'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Contact form submitted successfully');
    });

    it('should return validation error for missing required fields', async () => {
      const contactData = {
        name: '',
        email: 'invalid-email',
        subject: 'Hi',
        message: 'Short'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });

    it('should return validation error for invalid email', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'invalid-email',
        subject: 'Valid Subject',
        message: 'This is a valid message with enough characters.'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for short name', async () => {
      const contactData = {
        name: 'J',
        email: 'john@example.com',
        subject: 'Valid Subject',
        message: 'This is a valid message with enough characters.'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for short subject', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Hi',
        message: 'This is a valid message with enough characters.'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for short message', async () => {
      const contactData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Valid Subject',
        message: 'Short'
      };

      const response = await request(app)
        .post('/api/public/contact')
        .send(contactData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});