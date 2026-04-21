const { pool } = require('../config/database');

class Ride {
  constructor(data) {
    this.id = data.id;
    this.pickup_location = data.pickup_location;
    this.destination = data.destination;
    this.country_code = data.country_code;
    this.phone_number = data.phone_number;
    this.passengers = data.passengers;
    this.bags = data.bags;
    this.schedule_time = data.schedule_time;
    this.is_scheduled = data.is_scheduled;
    this.status = data.status;
    this.price = data.price;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Create a new ride booking
   * @param {Object} rideData - Ride data
   * @returns {Promise<Ride>} Created ride
   */
  static async create(rideData) {
    try {
      const {
        pickup_location,
        destination,
        country_code,
        phone_number,
        passengers,
        bags,
        schedule_time = null,
        is_scheduled = false
      } = rideData;

      // Validate required fields
      if (!pickup_location || !destination || !country_code || !phone_number) {
        throw new Error('Missing required fields');
      }

      // Validate passengers and bags
      if (passengers < 1 || passengers > 8) {
        throw new Error('Passengers must be between 1 and 8');
      }

      if (bags < 0) {
        throw new Error('Bags cannot be negative');
      }

      const [result] = await pool.execute(
        `INSERT INTO rides (
          pickup_location, destination, country_code, phone_number, 
          passengers, bags, schedule_time, is_scheduled
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pickup_location,
          destination,
          country_code,
          phone_number,
          passengers,
          bags,
          schedule_time,
          is_scheduled
        ]
      );

      return await Ride.findById(result.insertId);
    } catch (error) {
      throw new Error(`Failed to create ride: ${error.message}`);
    }
  }

  /**
   * Find ride by ID
   * @param {number} id - Ride ID
   * @returns {Promise<Ride|null>} Ride or null
   */
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rides WHERE id = ?',
        [id]
      );

      return rows.length > 0 ? new Ride(rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find ride by ID: ${error.message}`);
    }
  }

  /**
   * Get all rides with pagination and filtering
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Rides data with pagination info
   */
  static async findAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null,
        search = null,
        startDate = null,
        endDate = null,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const conditions = [];
      const values = [];

      // Validate and sanitize sortBy to prevent SQL injection
      const allowedSortFields = ['created_at', 'updated_at', 'status', 'price', 'passengers'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

      // Add status filter
      if (status) {
        conditions.push('status = ?');
        values.push(status);
      }

      // Add search filter (search in phone number, pickup location, and destination)
      if (search) {
        conditions.push('(phone_number LIKE ? OR pickup_location LIKE ? OR destination LIKE ?)');
        const searchPattern = `%${search}%`;
        values.push(searchPattern, searchPattern, searchPattern);
      }

      // Add date range filter
      if (startDate) {
        conditions.push('created_at >= ?');
        values.push(startDate);
      }

      if (endDate) {
        conditions.push('created_at <= ?');
        values.push(endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Get total count
      const [countResult] = await pool.execute(
        `SELECT COUNT(*) as total FROM rides ${whereClause}`,
        values
      );
      const total = countResult[0].total;

      // Get rides with pagination - build query string safely
      const orderClause = `ORDER BY ${validSortBy} ${validSortOrder}`;
      const limitClause = `LIMIT ${limitNum} OFFSET ${offset}`;
      
      const [rows] = await pool.execute(
        `SELECT * FROM rides ${whereClause} ${orderClause} ${limitClause}`,
        values
      );

      const rides = rows.map(row => new Ride(row));

      return {
        rides,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1
        }
      };
    } catch (error) {
      throw new Error(`Failed to get rides: ${error.message}`);
    }
  }

  /**
   * Update ride
   * @param {number} id - Ride ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Ride|null>} Updated ride or null
   */
  static async update(id, updateData) {
    try {
      const allowedFields = ['status', 'price', 'pickup_location', 'destination', 'passengers', 'bags'];
      const updates = [];
      const values = [];

      // Only update allowed fields
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);

      await pool.execute(
        `UPDATE rides SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        values
      );

      return await Ride.findById(id);
    } catch (error) {
      throw new Error(`Failed to update ride: ${error.message}`);
    }
  }

  /**
   * Delete ride
   * @param {number} id - Ride ID
   * @returns {Promise<boolean>} Success status
   */
  static async delete(id) {
    try {
      const [result] = await pool.execute('DELETE FROM rides WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete ride: ${error.message}`);
    }
  }

  /**
   * Get rides by status
   * @param {string} status - Ride status
   * @returns {Promise<Ride[]>} Array of rides
   */
  static async findByStatus(status) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rides WHERE status = ? ORDER BY created_at DESC',
        [status]
      );

      return rows.map(row => new Ride(row));
    } catch (error) {
      throw new Error(`Failed to get rides by status: ${error.message}`);
    }
  }

  /**
   * Get rides by phone number
   * @param {string} phoneNumber - Phone number
   * @returns {Promise<Ride[]>} Array of rides
   */
  static async findByPhoneNumber(phoneNumber) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM rides WHERE phone_number = ? ORDER BY created_at DESC',
        [phoneNumber]
      );

      return rows.map(row => new Ride(row));
    } catch (error) {
      throw new Error(`Failed to get rides by phone number: ${error.message}`);
    }
  }

  /**
   * Get analytics data for a date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} Analytics data
   */
  static async getAnalytics(startDate, endDate) {
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_rides,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_rides,
          COUNT(CASE WHEN status = 'booked' THEN 1 END) as pending_rides,
          COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_rides,
          COALESCE(SUM(CASE WHEN status = 'completed' AND price IS NOT NULL THEN price END), 0) as total_earnings,
          COALESCE(AVG(CASE WHEN status = 'completed' AND price IS NOT NULL THEN price END), 0) as avg_price
        FROM rides 
        WHERE created_at BETWEEN ? AND ?`,
        [startDate, endDate]
      );

      return rows[0];
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  /**
   * Convert to JSON
   * @returns {Object} Ride object
   */
  toJSON() {
    return {
      ...this,
      is_scheduled: Boolean(this.is_scheduled) // Convert MySQL TINYINT to boolean
    };
  }
}

module.exports = Ride;