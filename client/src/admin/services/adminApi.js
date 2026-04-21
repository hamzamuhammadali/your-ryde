import { adminAPI } from '../../services/api';

// Admin authentication service
export const authService = {
  login: async (email, password) => {
    try {
      const response = await adminAPI.login({ email, password });
      const { accessToken, user } = response.data.data; // Note: server returns data.data structure

      // Store token in localStorage
      localStorage.setItem('adminToken', accessToken);
      localStorage.setItem('adminUser', JSON.stringify(user));

      return { success: true, data: { token: accessToken, user } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Don't use window.location.href as it breaks React Router
    // Let the AuthContext handle the state change and ProtectedRoute will redirect
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('adminUser');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  }
};

// Admin ride management service
export const rideService = {
  getAllRides: async (page = 1, limit = 10, filters = {}) => {
    try {
      // Filter out empty values to avoid sending empty strings
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      const params = { page, limit, ...cleanFilters };
      const response = await adminAPI.getAllRides(params);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch rides'
      };
    }
  },

  updateStatus: async (rideId, status) => {
    try {
      const response = await adminAPI.updateRideStatus(rideId, status);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update ride status'
      };
    }
  },

  updatePrice: async (rideId, price) => {
    try {
      const response = await adminAPI.updateRidePrice(rideId, price);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update ride price'
      };
    }
  }
};

// Admin analytics service
export const analyticsService = {
  getAnalytics: async (period = '7days') => {
    try {
      const response = await adminAPI.getAnalytics(period);
      // Server returns data in response.data.data structure with summary nested
      const analyticsData = response.data.data;

      // Flatten the summary data for easier component access
      const flattenedData = {
        ...analyticsData.summary,
        period: analyticsData.period,
        startDate: analyticsData.startDate,
        endDate: analyticsData.endDate,
        // Transform earnings_data to match component expectations
        earnings_data: (analyticsData.earnings_data || []).map(item => ({
          date: item.date,
          earnings: item.earnings,
          rides: item.rides_count // Map rides_count to rides
        }))
      };

      return { success: true, data: flattenedData };
    } catch (error) {
      console.error('Analytics service error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch analytics'
      };
    }
  }
};