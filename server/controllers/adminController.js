const Ride = require('../models/Ride');

/**
 * Get all rides with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRides = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'updated_at', 'status', 'price', 'passengers'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Validate status filter - only use if not empty
    const allowedStatuses = ['booked', 'in_progress', 'completed'];
    const validStatus = status && status.trim() !== '' && allowedStatuses.includes(status) ? status : null;

    // Validate search filter - only use if not empty
    const validSearch = search && search.trim() !== '' ? search.trim() : null;

    const options = {
      page: pageNum,
      limit: limitNum,
      status: validStatus,
      search: validSearch,
      startDate,
      endDate,
      sortBy: validSortBy,
      sortOrder: validSortOrder
    };

    const result = await Ride.findAll(options);

    res.status(200).json({
      success: true,
      message: 'Rides retrieved successfully',
      data: {
        rides: result.rides.map(ride => ride.toJSON()),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve rides'
    });
  }
};

/**
 * Update ride status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ride ID
    const rideId = parseInt(id);
    if (isNaN(rideId) || rideId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ride ID'
      });
    }

    // Validate status
    const allowedStatuses = ['booked', 'in_progress', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: booked, in_progress, completed'
      });
    }

    // Check if ride exists
    const existingRide = await Ride.findById(rideId);
    if (!existingRide) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Update ride status
    const updatedRide = await Ride.update(rideId, { status });

    res.status(200).json({
      success: true,
      message: 'Ride status updated successfully',
      data: {
        ride: updatedRide.toJSON()
      }
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ride status'
    });
  }
};

/**
 * Update ride price
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRidePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // Validate ride ID
    const rideId = parseInt(id);
    if (isNaN(rideId) || rideId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ride ID'
      });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid price. Must be a positive number'
      });
    }

    // Check if ride exists
    const existingRide = await Ride.findById(rideId);
    if (!existingRide) {
      return res.status(404).json({
        success: false,
        error: 'Ride not found'
      });
    }

    // Update ride price
    const updatedRide = await Ride.update(rideId, { price: priceNum });

    res.status(200).json({
      success: true,
      message: 'Ride price updated successfully',
      data: {
        ride: updatedRide.toJSON()
      }
    });
  } catch (error) {
    console.error('Update ride price error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ride price'
    });
  }
};

/**
 * Get analytics data with filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = '7days' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Must be one of: 7days, 1month, 6months, 1year'
        });
    }

    const endDate = now;

    // Get analytics data
    const analytics = await Ride.getAnalytics(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Get daily earnings data for chart
    const dailyEarnings = await getDailyEarnings(startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        summary: {
          total_rides: parseInt(analytics.total_rides),
          completed_rides: parseInt(analytics.completed_rides),
          pending_rides: parseInt(analytics.pending_rides),
          in_progress_rides: parseInt(analytics.in_progress_rides),
          total_earnings: parseFloat(analytics.total_earnings),
          average_price: parseFloat(analytics.avg_price)
        },
        earnings_data: dailyEarnings
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics'
    });
  }
};

/**
 * Helper function to get daily earnings data for charts
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Daily earnings data
 */
const getDailyEarnings = async (startDate, endDate) => {
  try {
    const { pool } = require('../config/database');
    
    const [rows] = await pool.execute(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as rides_count,
        COALESCE(SUM(CASE WHEN status = 'completed' AND price IS NOT NULL THEN price END), 0) as earnings
      FROM rides 
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    );

    return rows.map(row => ({
      date: row.date,
      rides_count: parseInt(row.rides_count),
      earnings: parseFloat(row.earnings)
    }));
  } catch (error) {
    console.error('Get daily earnings error:', error);
    return [];
  }
};

module.exports = {
  getRides,
  updateRideStatus,
  updateRidePrice,
  getAnalytics
};