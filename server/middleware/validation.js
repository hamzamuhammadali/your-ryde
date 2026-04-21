const { body, validationResult, param, query } = require('express-validator');

/**
 * Handle validation errors with enhanced security logging
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    console.warn(`Validation failed for ${req.method} ${req.path}:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      errors: errors.array().map(err => ({ field: err.param, message: err.msg }))
    });
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Admin login validation rules with enhanced security
 */
const validateAdminLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Valid email is required and must be less than 255 characters')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .withMessage('Email format is invalid')
    .escape(),
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters long')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/)
    .withMessage('Password contains invalid characters'),
  handleValidationErrors
];

/**
 * Refresh token validation rules
 */
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  handleValidationErrors
];

/**
 * General email validation
 */
const validateEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

/**
 * Password validation
 */
const validatePassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  handleValidationErrors
];

/**
 * Ride booking validation rules with enhanced security
 */
const validateRideBooking = [
  body('pickup_location')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ min: 3, max: 500 })
    .withMessage('Pickup location is required and must be between 3 and 500 characters')
    .matches(/^[a-zA-Z0-9\s,.-]+$/)
    .withMessage('Pickup location contains invalid characters'),
  body('destination')
    .notEmpty()
    .trim()
    .escape()
    .isLength({ min: 3, max: 500 })
    .withMessage('Destination is required and must be between 3 and 500 characters')
    .matches(/^[a-zA-Z0-9\s,.-]+$/)
    .withMessage('Destination contains invalid characters'),
  body('country_code')
    .notEmpty()
    .trim()
    .escape()
    .matches(/^\+\d{1,4}$/)
    .withMessage('Country code is required and must be in format +XXX'),
  body('phone_number')
    .notEmpty()
    .trim()
    .escape()
    .matches(/^\d{7,15}$/)
    .withMessage('Phone number is required and must be 7-15 digits'),
  body('passengers')
    .isInt({ min: 1, max: 8 })
    .withMessage('Passengers must be between 1 and 8'),
  body('bags')
    .isInt({ min: 0, max: 10 })
    .withMessage('Bags must be between 0 and 10'),
  body('is_scheduled')
    .optional()
    .custom((value) => {
      if (value !== undefined && value !== null && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        throw new Error('is_scheduled must be a boolean');
      }
      return true;
    }),
  body('schedule_time')
    .custom((value, { req }) => {
      const isScheduled = req.body.is_scheduled === true || req.body.is_scheduled === 'true';
      const hasScheduleTime = value && value.trim() !== '';
      
      if (isScheduled && !hasScheduleTime) {
        throw new Error('Schedule time is required when is_scheduled is true');
      }
      
      if (hasScheduleTime && !isScheduled) {
        throw new Error('is_scheduled must be true when schedule_time is provided');
      }
      
      if (hasScheduleTime) {
        const scheduleDate = new Date(value);
        const now = new Date();
        if (isNaN(scheduleDate.getTime())) {
          throw new Error('Schedule time must be a valid date');
        }
        if (scheduleDate <= now) {
          throw new Error('Schedule time must be in the future');
        }
      }
      
      return true;
    }),
  handleValidationErrors
];

/**
 * Ride status update validation rules
 */
const validateRideStatusUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Ride ID must be a positive integer'),
  body('status')
    .notEmpty()
    .isIn(['booked', 'in_progress', 'completed'])
    .withMessage('Status must be one of: booked, in_progress, completed'),
  handleValidationErrors
];

/**
 * Ride price update validation rules
 */
const validateRidePriceUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Ride ID must be a positive integer'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors
];

/**
 * Analytics query validation rules
 */
const validateAnalyticsQuery = [
  query('period')
    .optional()
    .isIn(['7days', '1month', '6months', '1year'])
    .withMessage('Period must be one of: 7days, 1month, 6months, 1year'),
  handleValidationErrors
];

/**
 * Rides query validation rules
 */
const validateRidesQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .custom((value) => {
      // Skip validation if empty
      if (!value || value.trim() === '') {
        return true;
      }
      // Validate if not empty
      if (!['booked', 'in_progress', 'completed'].includes(value)) {
        throw new Error('Status must be one of: booked, in_progress, completed');
      }
      return true;
    }),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'status', 'price', 'passengers'])
    .withMessage('SortBy must be one of: created_at, updated_at, status, price, passengers'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('SortOrder must be ASC or DESC'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

/**
 * Contact form validation rules with enhanced security
 */
const validateContactForm = [
  body('name')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Valid email is required')
    .escape(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .escape()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('subject')
    .trim()
    .escape()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .escape()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateAdminLogin,
  validateRefreshToken,
  validateEmail,
  validatePassword,
  validateRideBooking,
  validateRideStatusUpdate,
  validateRidePriceUpdate,
  validateAnalyticsQuery,
  validateRidesQuery,
  validateContactForm
};