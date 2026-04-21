const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Create tables directly
 */
async function createTables() {
  let connection;
  
  try {
    console.log('🔄 Creating database tables...\n');

    // Connect to the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
      database: 'ryde_app'
    });

    console.log('✅ Connected to ryde_app database');

    // Create users table
    console.log('🔄 Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);
    console.log('✅ Users table created');

    // Create rides table
    console.log('🔄 Creating rides table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS rides (
        id INT PRIMARY KEY AUTO_INCREMENT,
        pickup_location TEXT NOT NULL,
        destination TEXT NOT NULL,
        country_code VARCHAR(10) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        passengers INT NOT NULL CHECK (passengers BETWEEN 1 AND 8),
        bags INT NOT NULL CHECK (bags >= 0),
        schedule_time DATETIME NULL,
        is_scheduled BOOLEAN DEFAULT FALSE,
        status ENUM('booked', 'in_progress', 'completed') DEFAULT 'booked',
        price DECIMAL(10,2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_schedule_time (schedule_time),
        INDEX idx_phone (phone_number)
      )
    `);
    console.log('✅ Rides table created');

    // Insert default admin user
    console.log('🔄 Creating default admin user...');
    await connection.execute(`
      INSERT IGNORE INTO users (email, password, role) 
      VALUES ('admin@ryde.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9S/EG', 'admin')
    `);
    console.log('✅ Default admin user created');

    // Verify tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n✅ Tables created:', tables.map(t => Object.values(t)[0]));

    // Check table counts
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [rideCount] = await connection.execute('SELECT COUNT(*) as count FROM rides');
    
    console.log('✅ Users count:', userCount[0].count);
    console.log('✅ Rides count:', rideCount[0].count);

    console.log('\n🎉 Database tables created successfully!');

  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if executed directly
if (require.main === module) {
  createTables();
}

module.exports = createTables;