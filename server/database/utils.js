const { pool } = require('../config/database');

/**
 * Execute a raw SQL query
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, params = []) => {
  try {
    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    throw new Error(`Query execution failed: ${error.message}`);
  }
};

/**
 * Begin a database transaction
 * @returns {Promise<Object>} Connection object
 */
const beginTransaction = async () => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
};

/**
 * Commit a transaction
 * @param {Object} connection - Database connection
 */
const commitTransaction = async (connection) => {
  await connection.commit();
  connection.release();
};

/**
 * Rollback a transaction
 * @param {Object} connection - Database connection
 */
const rollbackTransaction = async (connection) => {
  await connection.rollback();
  connection.release();
};

/**
 * Check if a table exists
 * @param {string} tableName - Name of the table
 * @returns {Promise<boolean>} True if table exists
 */
const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM information_schema.tables 
       WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );
    return rows[0].count > 0;
  } catch (error) {
    throw new Error(`Failed to check table existence: ${error.message}`);
  }
};

/**
 * Get table row count
 * @param {string} tableName - Name of the table
 * @returns {Promise<number>} Number of rows
 */
const getTableRowCount = async (tableName) => {
  try {
    const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ??`, [tableName]);
    return rows[0].count;
  } catch (error) {
    throw new Error(`Failed to get row count: ${error.message}`);
  }
};

/**
 * Truncate a table
 * @param {string} tableName - Name of the table
 * @returns {Promise<void>}
 */
const truncateTable = async (tableName) => {
  try {
    await pool.execute(`TRUNCATE TABLE ??`, [tableName]);
  } catch (error) {
    throw new Error(`Failed to truncate table: ${error.message}`);
  }
};

/**
 * Get database connection pool stats
 * @returns {Object} Pool statistics
 */
const getPoolStats = () => {
  return {
    totalConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    acquiringConnections: pool.pool._acquiringConnections.length,
    connectionLimit: pool.pool.config.connectionLimit
  };
};

/**
 * Close all database connections
 * @returns {Promise<void>}
 */
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error.message);
    throw error;
  }
};

module.exports = {
  executeQuery,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  tableExists,
  getTableRowCount,
  truncateTable,
  getPoolStats,
  closePool
};