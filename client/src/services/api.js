import axios from 'axios';
import { getSecurityHeaders } from '../utils/security';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in milliseconds
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// Create axios instance with base configuration and security headers
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...getSecurityHeaders()
  },
});

// Retry mechanism utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api(config);
  } catch (error) {
    const shouldRetry = retryCount < RETRY_CONFIG.maxRetries && 
                       RETRY_CONFIG.retryCondition(error);
    
    if (shouldRetry) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
      console.warn(`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      await sleep(delay);
      return retryRequest(config, retryCount + 1);
    }
    
    throw error;
  }
};

// Request interceptor to add auth token and retry config
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add retry metadata
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling, logging, and security monitoring
api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    return response;
  },
  (error) => {
    // Log failed requests
    if (process.env.NODE_ENV === 'development') {
      const duration = error.config?.metadata ? new Date() - error.config.metadata.startTime : 0;
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'} (${duration}ms)`);
    }
    
    // Security monitoring for specific error codes
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded - please slow down requests');
    } else if (error.response?.status === 403) {
      console.warn('Access forbidden - check permissions');
    } else if (error.response?.status === 401) {
      // Clear token on unauthorized - let React Router handle navigation
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      console.warn('Authentication failed - token cleared');
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API methods with retry support
const createApiMethod = (method, url, options = {}) => {
  return async (data, config = {}) => {
    const requestConfig = {
      method,
      url,
      ...config,
      ...(data && (method === 'get' ? { params: data } : { data }))
    };
    
    if (options.enableRetry !== false) {
      return retryRequest(requestConfig);
    }
    
    return api(requestConfig);
  };
};

// Public API endpoints
export const publicAPI = {
  // Create ride booking with retry
  createRide: createApiMethod('post', '/public/rides'),
  
  // Submit contact form with retry
  submitContact: createApiMethod('post', '/public/contact'),
  
  // Get ride status (public) with retry
  getRideStatus: (rideId) => retryRequest({ method: 'get', url: `/public/rides/${rideId}` }),
};

// Admin API endpoints
export const adminAPI = {
  // Authentication (no retry for login to avoid account lockout)
  login: createApiMethod('post', '/admin/auth/login', { enableRetry: false }),
  
  // Ride management with retry
  getAllRides: createApiMethod('get', '/admin/rides'),
  updateRideStatus: (rideId, status) => retryRequest({
    method: 'put',
    url: `/admin/rides/${rideId}/status`,
    data: { status }
  }),
  updateRidePrice: (rideId, price) => retryRequest({
    method: 'put',
    url: `/admin/rides/${rideId}/price`,
    data: { price }
  }),
  
  // Analytics with retry
  getAnalytics: createApiMethod('get', '/admin/analytics'),
};

// Utility function for manual retry
export const withRetry = async (apiCall, options = {}) => {
  const maxRetries = options.maxRetries || RETRY_CONFIG.maxRetries;
  const retryDelay = options.retryDelay || RETRY_CONFIG.retryDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const shouldRetry = !isLastAttempt && RETRY_CONFIG.retryCondition(error);
      
      if (shouldRetry) {
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`API call failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
};

export default api;