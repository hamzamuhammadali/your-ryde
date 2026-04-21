#!/usr/bin/env node

const { initDatabase } = require('./config/database');
const { initializeDatabase } = require('./database/init');
const User = require('./models/User');

async function testLogin() {
  try {
    console.log('🔄 Testing database connection and login setup...');
    
    // Test database connection
    await initDatabase();
    console.log('✅ Database connection successful');
    
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');
    
    // Check if admin user exists
    const adminUser = await User.findByEmail('admin@ryde.com');
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email);
      
      // Test password verification
      const isPasswordValid = await adminUser.verifyPassword('admin123');
      if (isPasswordValid) {
        console.log('✅ Admin password verification successful');
      } else {
        console.log('❌ Admin password verification failed');
      }
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@ryde.com');
    console.log('   Password: admin123');
    console.log('   Login URL: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testLogin();