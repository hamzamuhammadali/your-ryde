const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { 
  validateAdminLogin, 
  validateRefreshToken,
  validateRideStatusUpdate,
  validateRidePriceUpdate,
  validateAnalyticsQuery,
  validateRidesQuery
} = require('../middleware/validation');
const { adminLogin, refreshToken, adminLogout, getCurrentUser } = require('../controllers/authController');
const { getRides, updateRideStatus, updateRidePrice, getAnalytics } = require('../controllers/adminController');

// Authentication routes (public)
router.post('/auth/login', validateAdminLogin, adminLogin);
router.post('/auth/refresh', validateRefreshToken, refreshToken);
router.post('/auth/logout', adminLogout);

// Protected routes (require authentication)
router.use(authenticateToken);
router.use(requireAdmin);

// Get current user profile
router.get('/auth/me', getCurrentUser);

// Admin dashboard endpoints
router.get('/rides', validateRidesQuery, getRides);
router.put('/rides/:id/status', validateRideStatusUpdate, updateRideStatus);
router.put('/rides/:id/price', validateRidePriceUpdate, updateRidePrice);
router.get('/analytics', validateAnalyticsQuery, getAnalytics);

module.exports = router;