import geolocationService, { 
  getCurrentLocation, 
  isGeolocationSupported, 
  getErrorMessage,
  GEOLOCATION_ERRORS,
  GEOLOCATION_ERROR_MESSAGES 
} from '../geolocation';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  clearWatch: jest.fn(),
  watchPosition: jest.fn()
};

// Setup geolocation mock
const setupGeolocationMock = (supported = true) => {
  if (supported) {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true
    });
  } else {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true
    });
  }
};

describe('GeolocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    setupGeolocationMock(true); // Default to supported
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isGeolocationSupported', () => {
    it('returns true when geolocation is supported', () => {
      setupGeolocationMock(true);
      expect(isGeolocationSupported()).toBe(true);
    });

    it('returns false when geolocation is not supported', () => {
      setupGeolocationMock(false);
      expect(isGeolocationSupported()).toBe(false);
    });
  });

  describe('getCurrentPosition', () => {
    it('resolves with position when geolocation succeeds', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 100);
      });

      const promise = getCurrentLocation();
      jest.advanceTimersByTime(100);
      
      const result = await promise;
      expect(result).toEqual(mockPosition);
    });

    it('rejects with NOT_SUPPORTED error when geolocation is not available', async () => {
      setupGeolocationMock(false);
      
      await expect(getCurrentLocation()).rejects.toThrow(GEOLOCATION_ERRORS.NOT_SUPPORTED);
    });

    it('retries on timeout errors', async () => {
      let callCount = 0;
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        callCount++;
        if (callCount <= 2) {
          setTimeout(() => error({ code: 3 }), 100); // TIMEOUT
        } else {
          setTimeout(() => success({
            coords: { latitude: 40.7128, longitude: -74.0060, accuracy: 10 }
          }), 100);
        }
      });

      const promise = getCurrentLocation({ maxRetries: 2, retryDelay: 1000 });
      
      // First attempt fails
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Wait for retry delay
      jest.advanceTimersByTime(1000);
      
      // Second attempt fails
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Wait for retry delay
      jest.advanceTimersByTime(2000);
      
      // Third attempt succeeds
      jest.advanceTimersByTime(100);
      
      const result = await promise;
      expect(result.coords.latitude).toBe(40.7128);
      expect(callCount).toBe(3);
    });

    it('rejects after max retries are exhausted', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        setTimeout(() => error({ code: 3 }), 100); // TIMEOUT
      });

      const promise = getCurrentLocation({ maxRetries: 1, retryDelay: 1000 });
      
      // First attempt fails
      jest.advanceTimersByTime(100);
      await Promise.resolve();
      
      // Wait for retry delay
      jest.advanceTimersByTime(1000);
      
      // Second attempt fails
      jest.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow(GEOLOCATION_ERRORS.TIMEOUT);
    });

    it('does not retry on permission denied errors', async () => {
      let callCount = 0;
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        callCount++;
        setTimeout(() => error({ code: 1 }), 100); // PERMISSION_DENIED
      });

      const promise = getCurrentLocation({ maxRetries: 2 });
      jest.advanceTimersByTime(100);
      
      await expect(promise).rejects.toThrow(GEOLOCATION_ERRORS.PERMISSION_DENIED);
      expect(callCount).toBe(1);
    });
  });

  describe('formatCoordinates', () => {
    it('formats coordinates correctly', () => {
      const position = {
        coords: {
          latitude: 40.712776,
          longitude: -74.005974
        }
      };

      const formatted = geolocationService.formatCoordinates(position);
      expect(formatted).toBe('40.712776, -74.005974');
    });
  });

  describe('getAccuracyInfo', () => {
    it('returns high accuracy for accuracy < 10', () => {
      const position = { coords: { accuracy: 5 } };
      expect(geolocationService.getAccuracyInfo(position)).toBe('High accuracy');
    });

    it('returns medium accuracy for accuracy < 100', () => {
      const position = { coords: { accuracy: 50 } };
      expect(geolocationService.getAccuracyInfo(position)).toBe('Medium accuracy');
    });

    it('returns low accuracy for accuracy >= 100', () => {
      const position = { coords: { accuracy: 150 } };
      expect(geolocationService.getAccuracyInfo(position)).toBe('Low accuracy');
    });
  });

  describe('mapGeolocationError', () => {
    it('maps error codes correctly', () => {
      expect(geolocationService.mapGeolocationError({ code: 1 })).toBe(GEOLOCATION_ERRORS.PERMISSION_DENIED);
      expect(geolocationService.mapGeolocationError({ code: 2 })).toBe(GEOLOCATION_ERRORS.POSITION_UNAVAILABLE);
      expect(geolocationService.mapGeolocationError({ code: 3 })).toBe(GEOLOCATION_ERRORS.TIMEOUT);
      expect(geolocationService.mapGeolocationError({ code: 999 })).toBe(GEOLOCATION_ERRORS.UNKNOWN);
    });
  });

  describe('shouldRetry', () => {
    it('returns true for retryable errors', () => {
      expect(geolocationService.shouldRetry(GEOLOCATION_ERRORS.POSITION_UNAVAILABLE)).toBe(true);
      expect(geolocationService.shouldRetry(GEOLOCATION_ERRORS.TIMEOUT)).toBe(true);
    });

    it('returns false for non-retryable errors', () => {
      expect(geolocationService.shouldRetry(GEOLOCATION_ERRORS.PERMISSION_DENIED)).toBe(false);
      expect(geolocationService.shouldRetry(GEOLOCATION_ERRORS.NOT_SUPPORTED)).toBe(false);
      expect(geolocationService.shouldRetry(GEOLOCATION_ERRORS.UNKNOWN)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns correct error messages', () => {
      expect(getErrorMessage(GEOLOCATION_ERRORS.PERMISSION_DENIED))
        .toBe(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERRORS.PERMISSION_DENIED]);
      
      expect(getErrorMessage(GEOLOCATION_ERRORS.NOT_SUPPORTED))
        .toBe(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERRORS.NOT_SUPPORTED]);
      
      expect(getErrorMessage('INVALID_ERROR'))
        .toBe(GEOLOCATION_ERROR_MESSAGES[GEOLOCATION_ERRORS.UNKNOWN]);
    });
  });

  describe('cancelCurrentRequest', () => {
    it('cancels ongoing geolocation request', () => {
      const mockWatchId = 123;
      geolocationService.currentRequest = mockWatchId;
      
      geolocationService.cancelCurrentRequest();
      
      expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(mockWatchId);
      expect(geolocationService.currentRequest).toBeNull();
    });
  });
});