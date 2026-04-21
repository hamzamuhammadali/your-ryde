const { pool } = require('../config/database');

async function createTestRides() {
  try {
    console.log('🔄 Creating test rides...');
    
    const testRides = [
      {
        pickup_location: '123 Main Street, New York',
        destination: '456 Broadway, New York',
        country_code: '+1',
        phone_number: '5551234567',
        passengers: 2,
        bags: 1,
        status: 'booked'
      },
      {
        pickup_location: '789 Park Avenue, New York',
        destination: '321 Fifth Avenue, New York',
        country_code: '+1',
        phone_number: '5559876543',
        passengers: 4,
        bags: 2,
        status: 'in_progress'
      },
      {
        pickup_location: 'JFK Airport, New York',
        destination: '100 Wall Street, New York',
        country_code: '+1',
        phone_number: '5555555555',
        passengers: 1,
        bags: 3,
        status: 'completed',
        price: 45.50
      }
    ];
    
    for (const ride of testRides) {
      const [result] = await pool.execute(
        `INSERT INTO rides (
          pickup_location, destination, country_code, phone_number, 
          passengers, bags, status, price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ride.pickup_location,
          ride.destination,
          ride.country_code,
          ride.phone_number,
          ride.passengers,
          ride.bags,
          ride.status,
          ride.price || null
        ]
      );
      
      console.log(`✅ Created ride ${result.insertId}: ${ride.pickup_location} → ${ride.destination}`);
    }
    
    console.log('✅ Test rides created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create test rides:', error.message);
    process.exit(1);
  }
}

createTestRides();