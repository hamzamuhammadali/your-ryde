const express = require('express');
const router = express.Router();
const { createRideBooking, getRideStatus } = require('../controllers/rideController');
const { validateRideBooking } = require('../middleware/validation');

/**
 * POST /api/public/rides
 * Create a new ride booking
 */
router.post('/rides', validateRideBooking, createRideBooking);

/**
 * GET /api/public/rides/:id
 * Get ride status by ID (public endpoint)
 */
router.get('/rides/:id', getRideStatus);

module.exports = router;