import React, { useState } from 'react';
import { publicAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import { validateAndSanitizeInput, validateEmail, validatePhoneNumber } from '../../utils/security';
import './ContactForm.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate and sanitize input based on field type
    let validation;
    switch (name) {
      case 'name':
        validation = validateAndSanitizeInput(value, {
          maxLength: 100,
          pattern: /^[a-zA-Z\s]*$/
        });
        break;
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        validation = validatePhoneNumber(value);
        break;
      case 'subject':
        validation = validateAndSanitizeInput(value, {
          maxLength: 200
        });
        break;
      case 'message':
        validation = validateAndSanitizeInput(value, {
          maxLength: 1000
        });
        break;
      default:
        validation = { sanitizedValue: value, isValid: true };
    }
    
    // Update form data with sanitized value
    setFormData(prev => ({
      ...prev,
      [name]: validation.sanitizedValue
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation with security
    const nameValidation = validateAndSanitizeInput(formData.name, {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s]+$/
    });
    if (!nameValidation.isValid) {
      if (formData.name.trim() === '') {
        newErrors.name = 'Name is required';
      } else {
        newErrors.name = nameValidation.error || 'Name can only contain letters and spaces';
      }
    }

    // Email validation with security
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      if (formData.email.trim() === '') {
        newErrors.email = 'Email is required';
      } else {
        newErrors.email = emailValidation.error;
      }
    }

    // Phone validation (optional but if provided, should be valid)
    if (formData.phone.trim()) {
      const phoneValidation = validatePhoneNumber(formData.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.error;
      }
    }

    // Subject validation with security
    const subjectValidation = validateAndSanitizeInput(formData.subject, {
      minLength: 5,
      maxLength: 200
    });
    if (!subjectValidation.isValid) {
      if (formData.subject.trim() === '') {
        newErrors.subject = 'Subject is required';
      } else {
        newErrors.subject = subjectValidation.error;
      }
    }

    // Message validation with security
    const messageValidation = validateAndSanitizeInput(formData.message, {
      minLength: 10,
      maxLength: 1000
    });
    if (!messageValidation.isValid) {
      if (formData.message.trim() === '') {
        newErrors.message = 'Message is required';
      } else {
        newErrors.message = messageValidation.error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Sanitize all form data before submission
      const sanitizedData = {
        name: validateAndSanitizeInput(formData.name, { maxLength: 100 }).sanitizedValue,
        email: validateEmail(formData.email).sanitizedValue,
        phone: formData.phone ? validatePhoneNumber(formData.phone).sanitizedValue : '',
        subject: validateAndSanitizeInput(formData.subject, { maxLength: 200 }).sanitizedValue,
        message: validateAndSanitizeInput(formData.message, { maxLength: 1000 }).sanitizedValue
      };
      
      const response = await publicAPI.submitContact(sanitizedData);
      
      if (response.data.success) {
        setSuccess('Thank you for your message! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        setError(response.data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError(
        err.response?.data?.error || 
        'Failed to send message. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      <form onSubmit={handleSubmit} className="contact-form">
        <h3 className="form-title">Send us a Message</h3>
        
        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
              disabled={loading}
              maxLength={100}
              autoComplete="name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email address"
              disabled={loading}
              maxLength={255}
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="optional">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="Enter your phone number"
              disabled={loading}
              maxLength={20}
              autoComplete="tel"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject <span className="required">*</span>
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`form-input ${errors.subject ? 'error' : ''}`}
              placeholder="Enter message subject"
              disabled={loading}
              maxLength={200}
            />
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message <span className="required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`form-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Enter your message here..."
            rows="6"
            disabled={loading}
            maxLength={1000}
          />
          {errors.message && <span className="error-text">{errors.message}</span>}
          <div className="char-count">{formData.message.length}/1000 characters</div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;