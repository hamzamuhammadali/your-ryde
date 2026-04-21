const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { pool } = require('../config/database');

// Mock the database pool
jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn()
  }
}));

describe('User Model Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    test('should hash password when creating user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'plainPassword123',
        role: 'admin'
      };

      const mockInsertResult = [{ insertId: 1 }];
      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.execute
        .mockResolvedValueOnce(mockInsertResult) // INSERT query
        .mockResolvedValueOnce([[mockUserData]]); // SELECT query

      const user = await User.create(userData);

      expect(pool.execute).toHaveBeenCalledWith(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        expect.arrayContaining([
          userData.email,
          expect.any(String), // hashed password
          userData.role
        ])
      );

      // Verify password was hashed
      const hashedPassword = pool.execute.mock.calls[0][1][1];
      expect(hashedPassword).not.toBe(userData.password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    test('should hash password when updating user', async () => {
      const updateData = {
        password: 'newPassword123'
      };

      const mockUserData = {
        id: 1,
        email: 'test@example.com',
        password: 'newHashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.execute
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // UPDATE query
        .mockResolvedValueOnce([[mockUserData]]); // SELECT query

      const user = await User.update(1, updateData);

      expect(pool.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET password = ?'),
        expect.arrayContaining([
          expect.any(String), // hashed password
          1
        ])
      );

      // Verify password was hashed
      const hashedPassword = pool.execute.mock.calls[0][1][0];
      expect(hashedPassword).not.toBe(updateData.password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('Password Verification', () => {
    test('should verify correct password', async () => {
      const plainPassword = 'testPassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const user = new User({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin'
      });

      const isValid = await user.verifyPassword(plainPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const user = new User({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin'
      });

      const isValid = await user.verifyPassword(wrongPassword);
      expect(isValid).toBe(false);
    });

    test('should handle password verification errors', async () => {
      const user = new User({
        id: 1,
        email: 'test@example.com',
        password: null, // This will cause bcrypt.compare to throw
        role: 'admin'
      });

      await expect(user.verifyPassword('anyPassword')).rejects.toThrow();
    });
  });

  describe('User Creation with Authentication', () => {
    test('should create admin user successfully', async () => {
      const userData = {
        email: 'admin@test.com',
        password: 'adminPassword123',
        role: 'admin'
      };

      const mockInsertResult = [{ insertId: 1 }];
      const mockUserData = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.execute
        .mockResolvedValueOnce(mockInsertResult)
        .mockResolvedValueOnce([[mockUserData]]);

      const user = await User.create(userData);

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe(userData.role);
      expect(user.password).toBeDefined();
    });

    test('should handle user creation errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      pool.execute.mockRejectedValue(new Error('Database error'));

      await expect(User.create(userData)).rejects.toThrow('Failed to create user');
    });
  });

  describe('User Authentication Queries', () => {
    test('should find user by email for authentication', async () => {
      const email = 'admin@test.com';
      const mockUserData = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.execute.mockResolvedValue([[mockUserData]]);

      const user = await User.findByEmail(email);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(email);
    });

    test('should return null when user not found by email', async () => {
      const email = 'nonexistent@test.com';

      pool.execute.mockResolvedValue([[]]);

      const user = await User.findByEmail(email);

      expect(user).toBeNull();
    });

    test('should find user by ID for token verification', async () => {
      const userId = 1;
      const mockUserData = {
        id: 1,
        email: 'admin@test.com',
        password: 'hashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.execute.mockResolvedValue([[mockUserData]]);

      const user = await User.findById(userId);

      expect(pool.execute).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userId);
    });
  });

  describe('User JSON Serialization', () => {
    test('should exclude password from JSON output', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.id).toBe(userData.id);
      expect(json.email).toBe(userData.email);
      expect(json.role).toBe(userData.role);
      expect(json.created_at).toBe(userData.created_at);
      expect(json.updated_at).toBe(userData.updated_at);
    });
  });
});