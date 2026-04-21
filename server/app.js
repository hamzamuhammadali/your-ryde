const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { initDatabase } = require('./config/database');
const { initializeDatabase } = require('./database/init');
const { 
  helmetConfig, 
  corsOptions, 
  generalRateLimit, 
  authRateLimit, 
  bookingRateLimit, 
  sanitizeInput 
} = require('./middleware/security');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize services and database on startup
const startServer = async () => {
  try {
    console.log('🔄 Starting Ryde Taxi Booking Server...');
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    await initDatabase();
    console.log('✅ Database connection successful');
    
    // Initialize database schema and default data
    console.log('🔄 Initializing database schema...');
    await initializeDatabase();
    console.log('✅ Database schema initialized');
    
    // Initialize services (this will load email service)
    console.log('🔄 Initializing services...');
    // Services are initialized when routes are loaded, so we just log here
    console.log('✅ Services initialized');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
    console.log('🔄 Server will continue with limited functionality...');
  }
};

// Security middleware with enhanced configuration
app.use(helmetConfig);
app.use(compression());

// Trust proxy for accurate IP addresses behind load balancers
app.set('trust proxy', 1);

// Enhanced rate limiting with different limits for different endpoints
app.use('/api/', generalRateLimit);

// CORS configuration with specific allowed origins
app.use(cors(corsOptions));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Apply input sanitization to all routes
app.use(sanitizeInput);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Ryde Taxi Booking API'
  });
});

// API routes - wrapped in try-catch to handle service loading errors
try {
  // Apply specific rate limiting to sensitive endpoints
  app.use('/api/public/rides', bookingRateLimit);
  app.use('/api/public', require('./routes/rides'));
  app.use('/api/public', require('./routes/contact'));
  
  // Apply auth rate limiting to admin authentication
  app.use('/api/admin/auth', authRateLimit);
  app.use('/api/admin', require('./routes/admin'));
  
  console.log('✅ API routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load API routes:', error.message);
  console.log('🔄 Server will continue with limited functionality...');
}

// Global error handler with enhanced security logging
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Enhanced error logging for security monitoring
  console.error('Server error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Don't expose internal error details in production
  const responseMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : message;
  
  res.status(statusCode).json({
    success: false,
    error: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer().then(() => {
    app.listen(PORT, () => {
      console.log('🚀 Server running on port', PORT);
      console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
      console.log('🔗 Health check: http://localhost:' + PORT + '/health');
      console.log('📝 Default admin credentials:');
      console.log('   📧 Email: admin@ryde.com');
      console.log('   🔑 Password: admin123');
      console.log('   🌐 Login URL: http://localhost:3000/admin/login');
      console.log('✅ Server ready to accept connections!');
    });
  }).catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = app;