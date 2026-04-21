const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../app');
const User = require('../models/User');
const { generateToken, generateRefreshToken, refreshAccessToken } = require('../middleware/auth');

// Mock the User model
jest.mock('../models/User');

describe('Authentication System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
    process.env.JWT_EXPIRES_IN = '24h';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  describe('JWT Token Generation', () => {
    const mockUser = {
      id: 1,
      email: 'admin@test.com',
      role: 'admin'
    };

    test('should generate valid access token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    test('should generate valid refresh token', () => {
      const refreshToken = generateRefreshToken(mockUser);
      expect(refreshToken).toBeDefined();
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.type).toBe('refresh');
    });
  });

  describe('Admin Login API', () => {
    const loginData = {
      email: 'admin@test.com',
      password: 'password123'
    };

    test('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        verifyPassword: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        })
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    test('should fail with invalid email', async () => {
      User.findByEmail.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should fail with invalid password', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        verifyPassword: jest.fn().mockResolvedValue(false)
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should fail with non-admin user', async () => {
      const mockUser = {
        id: 1,
        email: 'user@test.com',
        role: 'user',
        verifyPassword: jest.fn().mockResolvedValue(true)
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Admin access required');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/admin/auth/login')
        .send({
          email: 'admin@test.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Token Refresh API', () => {
    test('should refresh token successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        })
      };

      User.findById.mockResolvedValue(mockUser);

      const refreshToken = generateRefreshToken(mockUser);

      const response = await request(app)
        .post('/api/admin/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    test('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/refresh')
        .send({ refreshToken: 'invalid_token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/admin/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('Protected Routes', () => {
    test('should access protected route with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        })
      };

      User.findById.mockResolvedValue(mockUser);

      const token = generateToken(mockUser);

      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
    });

    test('should fail to access protected route without token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    test('should fail to access protected route with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid token');
    });

    test('should fail to access protected route with expired token', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      };

      // Create expired token
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/admin/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Token expired');
    });
  });

  describe('Logout API', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/admin/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });
  });

  describe('Refresh Token Function', () => {
    test('should refresh access token successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin',
        toJSON: jest.fn().mockReturnValue({
          id: 1,
          email: 'admin@test.com',
          role: 'admin'
        })
      };

      User.findById.mockResolvedValue(mockUser);

      const refreshToken = generateRefreshToken(mockUser);
      const result = await refreshAccessToken(refreshToken);

      expect(result.success).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should fail with invalid refresh token type', async () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      };

      // Create token without refresh type
      const invalidToken = jwt.sign(
        { userId: mockUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const result = await refreshAccessToken(invalidToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid refresh token type');
    });

    test('should fail when user not found', async () => {
      const mockUser = {
        id: 999,
        email: 'nonexistent@test.com',
        role: 'admin'
      };

      User.findById.mockResolvedValue(null);

      const refreshToken = generateRefreshToken(mockUser);
      const result = await refreshAccessToken(refreshToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });
});