const Ride = require('../models/Ride');

/**
 * Create a new ride booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRideBooking = async (req, res) => {
  try {
    const {
      pickup_location,
      destination,
      country_code,
      phone_number,
      passengers,
      bags,
      schedule_time,
      is_scheduled = false
    } = req.body;

    // Create ride data object
    const rideData = {
      pickup_location: pickup_location.trim(),
      destination: destination.trim(),
      country_code: country_code.trim(),
      phone_number: phone_number.trim(),
      passengers: parseInt(passengers),
      bags: parseInt(bags),
      schedule_time: schedule_time ? new Date(schedule_time) : null,
      is_scheduled: Boolean(is_scheduled)
    };

    // Create the ride
    const ride = await Ride.create(rideData);

    // TODO: Send notifications (will be implemented in task 5)
    // await sendBookingNotifications(ride);

    res.status(201).json({
      success: true,
      message: 'Ride booking created successfully',
      data: {
        id: ride.id,
        pickup_location: ride.pickup_location,
        destination: ride.destination,
        phone_number: ride.phone_number,
        passengers: ride.passengers,
        bags: ride.bags,
        schedule_time: ride.schedule_time,
        is_scheduled: Boolean(ride.is_scheduled),
        status: ride.status,
        created_at: ride.created_at
      }
    });
  } catch (error) {
    console.error('Error creating ride booking:', error);
    
    // Handle specific validation errors
    if (error.message.includes('Missing required fields') || 
        error.message.includes('Passengers must be') ||
        error.message.includes('Bags cannot be')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create ride booking. Please try again.'
    });
  }
};

/**
 * Get ride status by ID (public endpoint)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRideStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid ride ID is required'
      });
    }

    const ride = await Ride.findById(parseInt(id));

    if (!ride) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Return limited information for public endpoint
    res.json({
      success: true,
      data: {
        id: ride.id,
        status: ride.status,
        pickup_location: ride.pickup_location,
        destination: ride.destination,
        schedule_time: ride.schedule_time,
        is_scheduled: Boolean(ride.is_scheduled),
        created_at: ride.created_at
      }
    });
  } catch (error) {
    console.error('Error getting ride status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ride status. Please try again.'
    });
  }
};

module.exports = {
  createRideBooking,
  getRideStatus
};