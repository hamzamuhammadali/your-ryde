const User = require('../../models/User');
const bcrypt = require('bcryptjs');

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

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      };

      // Mock successful database insertion
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }]);

      const result = await User.create(userData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        email: userData.email,
        role: userData.role
      });
      expect(result.data.password).toBeUndefined(); // Password should not be returned
    });

    it('validates required fields', async () => {
      const invalidUserData = {
        email: '',
        password: ''
      };

      const result = await User.create(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('required');
    });

    it('validates email format', async () => {
      const invalidUserData = {
        email: 'invalid-email',
        password: 'password123',
        role: 'admin'
      };

      const result = await User.create(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('validates password length', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        password: '123', // Too short
        role: 'admin'
      };

      const result = await User.create(invalidUserData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('password');
    });

    it('handles database errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'admin'
      };

      // Mock database error
      mockConnection.execute.mockRejectedValueOnce(new Error('Database error'));

      const result = await User.create(userData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('findById', () => {
    it('finds user by ID successfully', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockConnection.execute.mockResolvedValueOnce([[mockUser]]);
      
      const result = await User.findById(1);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role
      });
      expect(result.data.password).toBeUndefined(); // Password should not be returned
    });

    it('returns null for non-existent user', async () => {
      mockConnection.execute.mockResolvedValueOnce([[]]);
      
      const result = await User.findById(999);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('handles invalid ID', async () => {
      const result = await User.findById('invalid');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });
  });

  describe('validatePassword', () => {
    it('validates correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      
      const isValid = await User.validatePassword(plainPassword, hashedPassword);
      
      expect(isValid).toBe(true);
    });

    it('rejects incorrect password', async () => {
      const plainPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      
      const isValid = await User.validatePassword(wrongPassword, hashedPassword);
      
      expect(isValid).toBe(false);
    });

    it('handles empty passwords', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const isValid = await User.validatePassword('', hashedPassword);
      
      expect(isValid).toBe(false);
    });
  });
});