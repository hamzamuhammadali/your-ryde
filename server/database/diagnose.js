require('dotenv').config();

/**
 * Diagnose database connection issues
 */
function diagnoseConnection() {
  console.log('🔍 Database Connection Diagnostics\n');
  
  console.log('Environment Variables:');
  console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('- DB_USER:', process.env.DB_USER || 'root');
  console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-2) : 'NOT SET');
  console.log('- DB_NAME:', process.env.DB_NAME || 'ryde_app');
  console.log('- DB_PORT:', process.env.DB_PORT || 3306);
  
  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Verify MySQL server is running:');
  console.log('   - Windows: Check Services for "MySQL" or run `net start mysql`');
  console.log('   - Check if port 3306 is listening: `netstat -an | findstr 3306`');
  
  console.log('\n2. Test MySQL connection manually:');
  console.log(`   mysql -h ${process.env.DB_HOST || 'localhost'} -u ${process.env.DB_USER || 'root'} -p`);
  
  console.log('\n3. Common solutions:');
  console.log('   - Ensure MySQL service is started');
  console.log('   - Verify username and password are correct');
  console.log('   - Check if root user has localhost access');
  console.log('   - Try creating a new MySQL user with proper permissions');
  
  console.log('\n4. Alternative connection test:');
  console.log('   You can also try connecting without specifying a database first:');
  console.log('   - Remove DB_NAME from .env temporarily');
  console.log('   - Test basic connection');
  console.log('   - Then create database manually');
  
  console.log('\n💡 If MySQL is not installed:');
  console.log('   - Download MySQL Community Server from mysql.com');
  console.log('   - Or use XAMPP/WAMP which includes MySQL');
  console.log('   - Or use Docker: `docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root1122 mysql:8.0`');
}

// Run diagnostics
diagnoseConnection();