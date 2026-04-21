#!/usr/bin/env node

const { pool, testConnection } = require('../config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('Database config:');
    console.log('  Host:', process.env.DB_HOST || 'localhost');
    console.log('  User:', process.env.DB_USER || 'root');
    console.log('  Database:', process.env.DB_NAME || 'ryde_app');
    console.log('  Port:', process.env.DB_PORT || 3306);
    
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
      
      // Test a simple query
      const [rows] = await pool.execute('SELECT 1 as test');
      console.log('✅ Test query successful:', rows[0]);
      
    } else {
      console.log('❌ Database connection failed!');
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Make sure MySQL is running');
      console.log('2. Check database credentials in .env file');
      console.log('3. Ensure database "ryde_app" exists');
      console.log('4. Verify user has proper permissions');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Common issues:');
    console.log('- MySQL server not running');
    console.log('- Wrong credentials in .env file');
    console.log('- Database does not exist');
    console.log('- Firewall blocking connection');
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();