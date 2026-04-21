import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for handling async operations with loading states, error handling, and retry mechanisms
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - State and control functions
 */
const useAsyncOperation = (asyncFunction, options = {}) => {
  const {
    initialData = null,
    onSuccess = () => {},
    onError = () => {},
    maxRetries = 0,
    retryDelay = 1000,
    retryCondition = () => true
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    if (!isMountedRef.current) return;
    
    setLoading(true);
    setError(null);

    const attemptOperation = async (attempt = 0) => {
      try {
        const result = await asyncFunction(...args, {
          signal: abortControllerRef.current.signal
        });
        
        if (!isMountedRef.current) return;
        
        setData(result);
        setRetryCount(0);
        onSuccess(result);
        return result;
        
      } catch (err) {
        if (!isMountedRef.current) return;
        
        // Don't retry if request was aborted
        if (err.name === 'AbortError') {
          return;
        }
        
        const shouldRetry = attempt < maxRetries && 
                           retryCondition(err) && 
                           isMountedRef.current;
        
        if (shouldRetry) {
          setRetryCount(attempt + 1);
          
          // Wait before retrying with exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          if (!isMountedRef.current) return;
          
          return attemptOperation(attempt + 1);
        } else {
          setError(err);
          onError(err);
          throw err;
        }
      }
    };

    try {
      const result = await attemptOperation();
      return result;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [asyncFunction, maxRetries, retryDelay, retryCondition, onSuccess, onError]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setData(initialData);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, [initialData]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    if (isMountedRef.current) {
      setLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    reset,
    cancel,
    // Computed states
    isIdle: !loading && !error && data === initialData,
    isSuccess: !loading && !error && data !== initialData,
    isError: !loading && error !== null,
    isRetrying: loading && retryCount > 0
  };
};

export default useAsyncOperation;