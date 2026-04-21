const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/database');

/**
 * Initialize database with schema
 */
const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // First, ensure database exists
    const connection = await pool.getConnection();
    await connection.query('CREATE DATABASE IF NOT EXISTS ryde_app');
    connection.release();
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split schema into individual statements and clean them
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // Execute each statement individually using the database connection
    for (const statement of statements) {
      try {
        console.log(`🔄 Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement);
        console.log(`✅ Success`);
      } catch (error) {
        // Continue with other statements if one fails (e.g., table already exists)
        console.log(`⚠️  Warning: ${error.message}`);
      }
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

/**
 * Drop all tables (for testing purposes)
 */
const dropTables = async () => {
  try {
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('DROP TABLE IF EXISTS rides');
    await pool.execute('DROP TABLE IF EXISTS users');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Tables dropped successfully');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error.message);
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  dropTables
};