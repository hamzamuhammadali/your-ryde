require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'ryde_app',
    port: process.env.DB_PORT || 3306
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // SMTP Email configuration
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@ryde.com',
    fromName: process.env.FROM_NAME || 'Ryde Taxi Service'
  },

  // WhatsApp configuration
  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || '',
    phoneNumber: process.env.WHATSAPP_PHONE_NUMBER || '',
    apiToken: process.env.WHATSAPP_API_TOKEN || ''
  },

  // Admin configuration
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@ryde.com',
    phone: process.env.ADMIN_PHONE || '+1234567890'
  }
};