const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');
    
    const email = 'admin@ryde.com';
    const password = 'admin123';
    const role = 'admin';
    
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log('Generated hash:', hashedPassword);
    
    // Delete existing admin user if exists
    await pool.execute('DELETE FROM users WHERE email = ?', [email]);
    
    // Insert new admin user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', role);
    console.log('🆔 User ID:', result.insertId);
    
    // Verify the password works
    const testResult = await bcrypt.compare(password, hashedPassword);
    console.log('🔍 Password verification test:', testResult ? '✅ PASS' : '❌ FAIL');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();