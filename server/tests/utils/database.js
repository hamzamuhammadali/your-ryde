const mysql = require('mysql2/promise');
const { dbConfig } = require('../../config/database');

// Test database configuration
const testDbConfig = {
  ...dbConfig,
  database: 'ryde_test'
};

let testConnection = null;

// Create test database connection
const createTestConnection = async () => {
  if (!testConnection) {
    testConnection = await mysql.createConnection(testDbConfig);
  }
  return testConnection;
};

// Close test database connection
const closeTestConnection = async () => {
  if (testConnection) {
    await testConnection.end();
    testConnection = null;
  }
};

// Create test database
const createTestDatabase = async () => {
  const connection = await mysql.createConnection({
    ...testDbConfig,
    database: undefined
  });
  
  await connection.execute(`CREATE DATABASE IF NOT EXISTS ${testDbConfig.database}`);
  await connection.end();
};

// Drop test database
const dropTestDatabase = async () => {
  const connection = await mysql.createConnection({
    ...testDbConfig,
    database: undefined
  });
  
  await connection.execute(`DROP DATABASE IF EXISTS ${testDbConfig.database}`);
  await connection.end();
};

// Setup test tables
const setupTestTables = async () => {
  const connection = await createTestConnection();
  
  // Create users table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin') DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  // Create rides table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS rides (
      id INT PRIMARY KEY AUTO_INCREMENT,
      pickup_location TEXT NOT NULL,
      destination TEXT NOT NULL,
      country_code VARCHAR(10) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      passengers INT NOT NULL CHECK (passengers BETWEEN 1 AND 8),
      bags INT NOT NULL CHECK (bags >= 0),
      schedule_time DATETIME,
      is_scheduled BOOLEAN DEFAULT FALSE,
      status ENUM('booked', 'in_progress', 'completed') DEFAULT 'booked',
      price DECIMAL(10,2) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status (status),
      INDEX idx_created_at (created_at),
      INDEX idx_schedule_time (schedule_time)
    )
  `);
};

// Clean test tables
const cleanTestTables = async () => {
  const connection = await createTestConnection();
  
  await connection.execute('DELETE FROM rides');
  await connection.execute('DELETE FROM users');
  await connection.execute('ALTER TABLE rides AUTO_INCREMENT = 1');
  await connection.execute('ALTER TABLE users AUTO_INCREMENT = 1');
};

// Insert test data
const insertTestUser = async (userData = {}) => {
  const connection = await createTestConnection();
  
  const defaultUser = {
    email: 'test@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO', // 'password'
    role: 'admin'
  };
  
  const user = { ...defaultUser, ...userData };
  
  const [result] = await connection.execute(
    'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
    [user.email, user.password, user.role]
  );
  
  return { id: result.insertId, ...user };
};

const insertTestRide = async (rideData = {}) => {
  const connection = await createTestConnection();
  
  const defaultRide = {
    pickup_location: 'Test Pickup Location',
    destination: 'Test Destination',
    country_code: '+1',
    phone_number: '1234567890',
    passengers: 2,
    bags: 1,
    schedule_time: null,
    is_scheduled: false,
    status: 'booked',
    price: null
  };
  
  const ride = { ...defaultRide, ...rideData };
  
  const [result] = await connection.execute(`
    INSERT INTO rides (
      pickup_location, destination, country_code, phone_number,
      passengers, bags, schedule_time, is_scheduled, status, price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    ride.pickup_location,
    ride.destination,
    ride.country_code,
    ride.phone_number,
    ride.passengers,
    ride.bags,
    ride.schedule_time,
    ride.is_scheduled,
    ride.status,
    ride.price
  ]);
  
  return { id: result.insertId, ...ride };
};

// Get test data
const getTestUser = async (id) => {
  const connection = await createTestConnection();
  
  const [rows] = await connection.execute(
    'SELECT * FROM users WHERE id = ?',
    [id]
  );
  
  return rows[0] || null;
};

const getTestRide = async (id) => {
  const connection = await createTestConnection();
  
  const [rows] = await connection.execute(
    'SELECT * FROM rides WHERE id = ?',
    [id]
  );
  
  return rows[0] || null;
};

const getAllTestRides = async () => {
  const connection = await createTestConnection();
  
  const [rows] = await connection.execute(
    'SELECT * FROM rides ORDER BY created_at DESC'
  );
  
  return rows;
};

// Count records
const countTestUsers = async () => {
  const connection = await createTestConnection();
  
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
  return rows[0].count;
};

const countTestRides = async () => {
  const connection = await createTestConnection();
  
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM rides');
  return rows[0].count;
};

// Execute raw query
const executeTestQuery = async (query, params = []) => {
  const connection = await createTestConnection();
  return await connection.execute(query, params);
};

module.exports = {
  createTestConnection,
  closeTestConnection,
  createTestDatabase,
  dropTestDatabase,
  setupTestTables,
  cleanTestTables,
  insertTestUser,
  insertTestRide,
  getTestUser,
  getTestRide,
  getAllTestRides,
  countTestUsers,
  countTestRides,
  executeTestQuery,
  testDbConfig
};