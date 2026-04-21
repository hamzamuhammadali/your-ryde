// Geolocation service with enhanced error handling and retry mechanisms

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
  UNKNOWN: 'UNKNOWN'
};

export const GEOLOCATION_ERROR_MESSAGES = {
  [GEOLOCATION_ERRORS.PERMISSION_DENIED]: 'Location access denied. Please enable location services in your browser settings.',
  [GEOLOCATION_ERRORS.POSITION_UNAVAILABLE]: 'Location information is unavailable. Please check your GPS or network connection.',
  [GEOLOCATION_ERRORS.TIMEOUT]: 'Location request timed out. Please try again.',
  [GEOLOCATION_ERRORS.NOT_SUPPORTED]: 'Geolocation is not supported by this browser. Please enter your location manually.',
  [GEOLOCATION_ERRORS.UNKNOWN]: 'An unknown error occurred while getting your location. Please try again.'
};

const DEFAULT_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000, // 15 seconds
  maximumAge: 300000, // 5 minutes
  maxRetries: 2,
  retryDelay: 2000 // 2 seconds
};

class GeolocationService {
  constructor() {
    this.updateSupport();
    this.currentRequest = null;
  }

  // Update support status (useful for testing)
  updateSupport() {
    this.isSupported = 'geolocation' in navigator && navigator.geolocation !== undefined;
  }

  // Check if geolocation is supported
  isGeolocationSupported() {
    this.updateSupport();
    return this.isSupported;
  }

  // Get current position with retry mechanism
  async getCurrentPosition(options = {}) {
    this.updateSupport();
    if (!this.isSupported) {
      throw new Error(GEOLOCATION_ERRORS.NOT_SUPPORTED);
    }

    const config = { ...DEFAULT_OPTIONS, ...options };
    
    return this.attemptGeolocation(config, 0);
  }

  // Attempt geolocation with retry logic
  async attemptGeolocation(config, retryCount) {
    return new Promise((resolve, reject) => {
      // Cancel any existing request
      if (this.currentRequest) {
        navigator.geolocation.clearWatch(this.currentRequest);
      }

      const timeoutId = setTimeout(() => {
        if (retryCount < config.maxRetries) {
          console.warn(`Geolocation timeout, retrying... (attempt ${retryCount + 1}/${config.maxRetries + 1})`);
          setTimeout(() => {
            this.attemptGeolocation(config, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, config.retryDelay);
        } else {
          reject(new Error(GEOLOCATION_ERRORS.TIMEOUT));
        }
      }, config.timeout);

      this.currentRequest = navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          this.currentRequest = null;
          resolve(position);
        },
        (error) => {
          clearTimeout(timeoutId);
          this.currentRequest = null;
          
          const errorType = this.mapGeolocationError(error);
          
          // Retry on certain errors
          if (this.shouldRetry(errorType) && retryCount < config.maxRetries) {
            console.warn(`Geolocation error: ${errorType}, retrying... (attempt ${retryCount + 1}/${config.maxRetries + 1})`);
            setTimeout(() => {
              this.attemptGeolocation(config, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, config.retryDelay);
          } else {
            reject(new Error(errorType));
          }
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge
        }
      );
    });
  }

  // Map native geolocation errors to our error types
  mapGeolocationError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return GEOLOCATION_ERRORS.PERMISSION_DENIED;
      case error.POSITION_UNAVAILABLE:
        return GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;
      case error.TIMEOUT:
        return GEOLOCATION_ERRORS.TIMEOUT;
      default:
        return GEOLOCATION_ERRORS.UNKNOWN;
    }
  }

  // Determine if we should retry based on error type
  shouldRetry(errorType) {
    return errorType === GEOLOCATION_ERRORS.POSITION_UNAVAILABLE || 
           errorType === GEOLOCATION_ERRORS.TIMEOUT;
  }

  // Cancel current geolocation request
  cancelCurrentRequest() {
    if (this.currentRequest) {
      navigator.geolocation.clearWatch(this.currentRequest);
      this.currentRequest = null;
    }
  }

  // Format coordinates as a readable string
  formatCoordinates(position) {
    const { latitude, longitude } = position.coords;
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // Get accuracy information
  getAccuracyInfo(position) {
    const accuracy = position.coords.accuracy;
    if (accuracy < 10) return 'High accuracy';
    if (accuracy < 100) return 'Medium accuracy';
    return 'Low accuracy';
  }

  // Watch position changes (for future use)
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isSupported) {
      errorCallback(new Error(GEOLOCATION_ERRORS.NOT_SUPPORTED));
      return null;
    }

    const config = { ...DEFAULT_OPTIONS, ...options };
    
    return navigator.geolocation.watchPosition(
      callback,
      (error) => errorCallback(new Error(this.mapGeolocationError(error))),
      config
    );
  }

  // Clear watch
  clearWatch(watchId) {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

// Create singleton instance
const geolocationService = new GeolocationService();

export default geolocationService;

// Convenience functions
export const getCurrentLocation = (options) => geolocationService.getCurrentPosition(options);
export const isGeolocationSupported = () => geolocationService.isGeolocationSupported();
export const getErrorMessage = (errorType) => GEOLOCATION_ERROR_MESSAGES[errorType] || GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERRORS.UNKNOWN];