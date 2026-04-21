import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Potentially unsafe HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} Sanitized HTML string
 */
export const sanitizeHtml = (dirty, options = {}) => {
  if (typeof dirty !== 'string') {
    return '';
  }

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    ...options
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
};

/**
 * Sanitize text content by removing all HTML tags
 * @param {string} text - Text that may contain HTML
 * @returns {string} Plain text without HTML tags
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  });
};

/**
 * Escape HTML entities in user input
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Validate and sanitize form input
 * @param {string} input - User input
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with sanitized value
 */
export const validateAndSanitizeInput = (input, options = {}) => {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHtml = false,
    pattern = null
  } = options;

  // Basic validation
  if (typeof input !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a string',
      sanitizedValue: ''
    };
  }

  // Length validation
  if (input.length < minLength) {
    return {
      isValid: false,
      error: `Input must be at least ${minLength} characters`,
      sanitizedValue: input
    };
  }

  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Input must be no more than ${maxLength} characters`,
      sanitizedValue: input.substring(0, maxLength)
    };
  }

  // Pattern validation
  if (pattern && !pattern.test(input)) {
    return {
      isValid: false,
      error: 'Input format is invalid',
      sanitizedValue: input
    };
  }

  // Sanitize based on options
  const sanitizedValue = allowHtml ? sanitizeHtml(input) : sanitizeText(input);

  return {
    isValid: true,
    error: null,
    sanitizedValue
  };
};

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param {string} url - URL to sanitize
 * @returns {string} Safe URL or empty string
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }

  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }

  // Allow only http, https, mailto, and tel protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  const hasProtocol = lowerUrl.includes('://') || lowerUrl.startsWith('mailto:') || lowerUrl.startsWith('tel:');
  
  if (hasProtocol) {
    const isAllowed = allowedProtocols.some(protocol => lowerUrl.startsWith(protocol));
    if (!isAllowed) {
      return '';
    }
  }

  return url;
};

/**
 * Validate phone number format
 * @param {string} phoneNumber - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phoneNumber) => {
  const phonePattern = /^\d{7,15}$/;
  const sanitized = sanitizeText(phoneNumber).replace(/\D/g, '');
  
  return {
    isValid: phonePattern.test(sanitized),
    sanitizedValue: sanitized,
    error: phonePattern.test(sanitized) ? null : 'Phone number must be 7-15 digits'
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitized = sanitizeText(email).toLowerCase().trim();
  
  return {
    isValid: emailPattern.test(sanitized),
    sanitizedValue: sanitized,
    error: emailPattern.test(sanitized) ? null : 'Please enter a valid email address'
  };
};

/**
 * Security headers for API requests
 */
export const getSecurityHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Add CSRF token if available
    ...(window.csrfToken && { 'X-CSRF-Token': window.csrfToken })
  };
};

/**
 * Safe JSON parse that handles potential XSS in JSON strings
 * @param {string} jsonString - JSON string to parse
 * @returns {Object|null} Parsed object or null if invalid
 */
export const safeJsonParse = (jsonString) => {
  try {
    if (typeof jsonString !== 'string') {
      return null;
    }

    // Basic check for potential XSS patterns in JSON
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(jsonString)) {
        console.warn('Potentially dangerous content detected in JSON string');
        return null;
      }
    }

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return null;
  }
};

export default {
  sanitizeHtml,
  sanitizeText,
  escapeHtml,
  validateAndSanitizeInput,
  sanitizeUrl,
  validatePhoneNumber,
  validateEmail,
  getSecurityHeaders,
  safeJsonParse
};