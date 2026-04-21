import {
  sanitizeHtml,
  sanitizeText,
  escapeHtml,
  validateAndSanitizeInput,
  sanitizeUrl,
  validatePhoneNumber,
  validateEmail,
  safeJsonParse
} from '../security';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    test('should remove script tags', () => {
      const dirty = '<script>alert("xss")</script><p>Safe content</p>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('<p>Safe content</p>');
    });

    test('should remove iframe tags', () => {
      const dirty = '<iframe src="evil.com"></iframe><p>Safe content</p>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<iframe>');
      expect(clean).toContain('<p>Safe content</p>');
    });

    test('should allow safe tags', () => {
      const dirty = '<p><strong>Bold</strong> and <em>italic</em> text</p>';
      const clean = sanitizeHtml(dirty);
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });

    test('should handle non-string input', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(123)).toBe('');
    });
  });

  describe('sanitizeText', () => {
    test('should remove all HTML tags', () => {
      const dirty = '<script>alert("xss")</script><p>Safe content</p>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Safe content');
    });

    test('should preserve text content', () => {
      const dirty = '<div>Hello <span>World</span></div>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('Hello World');
    });

    test('should handle non-string input', () => {
      expect(sanitizeText(null)).toBe('');
      expect(sanitizeText(undefined)).toBe('');
      expect(sanitizeText(123)).toBe('');
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML entities', () => {
      const text = '<script>alert("test")</script>';
      const escaped = escapeHtml(text);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).not.toContain('<script>');
    });

    test('should handle special characters', () => {
      const text = '& < > " \'';
      const escaped = escapeHtml(text);
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });

    test('should handle non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
    });
  });

  describe('validateAndSanitizeInput', () => {
    test('should validate minimum length', () => {
      const result = validateAndSanitizeInput('ab', { minLength: 3 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    test('should validate maximum length', () => {
      const result = validateAndSanitizeInput('a'.repeat(101), { maxLength: 100 });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('no more than 100 characters');
      expect(result.sanitizedValue).toHaveLength(100);
    });

    test('should validate pattern', () => {
      const result = validateAndSanitizeInput('123abc', { pattern: /^\d+$/ });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('format is invalid');
    });

    test('should sanitize HTML when allowHtml is true', () => {
      const result = validateAndSanitizeInput('<script>alert("xss")</script><p>Safe</p>', { allowHtml: true });
      expect(result.sanitizedValue).not.toContain('<script>');
      expect(result.sanitizedValue).toContain('<p>Safe</p>');
    });

    test('should remove HTML when allowHtml is false', () => {
      const result = validateAndSanitizeInput('<p>Test</p>', { allowHtml: false });
      expect(result.sanitizedValue).toBe('Test');
    });

    test('should handle non-string input', () => {
      const result = validateAndSanitizeInput(123);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be a string');
    });
  });

  describe('sanitizeUrl', () => {
    test('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
      expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
      expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
    });

    test('should block dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('');
      expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe('');
      expect(sanitizeUrl('vbscript:msgbox("xss")')).toBe('');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });

    test('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
      expect(sanitizeUrl('path/to/page')).toBe('path/to/page');
    });

    test('should handle non-string input', () => {
      expect(sanitizeUrl(null)).toBe('');
      expect(sanitizeUrl(undefined)).toBe('');
      expect(sanitizeUrl(123)).toBe('');
    });
  });

  describe('validatePhoneNumber', () => {
    test('should validate correct phone numbers', () => {
      const result = validatePhoneNumber('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('1234567890');
    });

    test('should reject invalid phone numbers', () => {
      const result = validatePhoneNumber('abc123');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('7-15 digits');
    });

    test('should sanitize phone numbers', () => {
      const result = validatePhoneNumber('123-456-7890');
      expect(result.sanitizedValue).toBe('1234567890');
    });

    test('should reject too short numbers', () => {
      const result = validatePhoneNumber('123456');
      expect(result.isValid).toBe(false);
    });

    test('should reject too long numbers', () => {
      const result = validatePhoneNumber('1234567890123456');
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      const result = validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    test('should reject invalid emails', () => {
      const result = validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('valid email address');
    });

    test('should normalize emails', () => {
      const result = validateEmail('  TEST@EXAMPLE.COM  ');
      expect(result.sanitizedValue).toBe('test@example.com');
    });

    test('should reject emails without domain', () => {
      const result = validateEmail('test@');
      expect(result.isValid).toBe(false);
    });

    test('should reject emails without @', () => {
      const result = validateEmail('testexample.com');
      expect(result.isValid).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    test('should parse valid JSON', () => {
      const result = safeJsonParse('{"name": "test"}');
      expect(result).toEqual({ name: 'test' });
    });

    test('should return null for invalid JSON', () => {
      const result = safeJsonParse('invalid json');
      expect(result).toBeNull();
    });

    test('should detect dangerous patterns', () => {
      const result = safeJsonParse('{"script": "<script>alert(\\"xss\\")</script>"}');
      expect(result).toBeNull();
    });

    test('should detect javascript protocol', () => {
      const result = safeJsonParse('{"url": "javascript:alert(\\"xss\\")"}');
      expect(result).toBeNull();
    });

    test('should detect event handlers', () => {
      const result = safeJsonParse('{"html": "<div onclick=\\"alert(\'xss\')\\"">test</div>"}');
      expect(result).toBeNull();
    });

    test('should handle non-string input', () => {
      expect(safeJsonParse(null)).toBeNull();
      expect(safeJsonParse(undefined)).toBeNull();
      expect(safeJsonParse(123)).toBeNull();
    });
  });
});