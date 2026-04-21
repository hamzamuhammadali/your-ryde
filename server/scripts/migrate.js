#!/usr/bin/env node

const { initializeDatabase, closePool } = require('../database');

/**
 * Run database migrations
 */
async function migrate() {
  try {
    console.log('🔄 Running database migrations...');
    
    await initializeDatabase();
    
    console.log('✅ Database migrations completed successfully!');
    console.log('📝 Default admin user created:');
    console.log('   Email: admin@ryde.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Please change the default password in production!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

migrate();