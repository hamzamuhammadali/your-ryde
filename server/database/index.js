// Database exports
const { pool, testConnection, initDatabase } = require('../config/database');
const { initializeDatabase, dropTables } = require('./init');
const {
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  tableExists,
  getTableRowCount,
  truncateTable,
  getPoolStats,
  closePool
} = require('./utils');

// Models
const User = require('../models/User');
const Ride = require('../models/Ride');

module.exports = {
  // Database connection
  pool,
  testConnection,
  initDatabase,
  
  // Database initialization
  initializeDatabase,
  dropTables,
  
  // Database utilities
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  tableExists,
  getTableRowCount,
  truncateTable,
  getPoolStats,
  closePool,
  
  // Models
  User,
  Ride
};