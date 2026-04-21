import React, { useState, useEffect } from 'react';
import { publicAPI, withRetry } from '../../services/api';
import geolocationService, { getErrorMessage } from '../../services/geolocation';
import { LoadingSpinner, Button, ErrorMessage, SuccessMessage, GeolocationFallback } from '../common';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import './BookingForm.css';

const PASSENGER_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);
const BAG_OPTIONS = [0, 1, 2, 3, 4, '5+'];

const BookingForm = () => {
  const [formData, setFormData] = useState({
    pickup_location: '',
    destination: '',
    phone: '',
    passengers: 1,
    bags: 0,
    schedule_time: '',
    is_scheduled: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [showLocationFallback, setShowLocationFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Real-time validation - only after field is touched
  useEffect(() => {
    if (touched.pickup_location) validateField('pickup_location', formData.pickup_location);
  }, [formData.pickup_location]);

  useEffect(() => {
    if (touched.destination) validateField('destination', formData.destination);
  }, [formData.destination]);

  useEffect(() => {
    if (touched.phone) validateField('phone', formData.phone);
  }, [formData.phone]);

  useEffect(() => {
    if (formData.is_scheduled && touched.schedule_time) {
      validateField('schedule_time', formData.schedule_time);
    }
  }, [formData.schedule_time, formData.is_scheduled]);

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'pickup_location':
        if (!value.trim()) {
          newErrors.pickup_location = 'Pickup location is required';
        } else if (value.trim().length < 3) {
          newErrors.pickup_location = 'Pickup location must be at least 3 characters';
        } else {
          delete newErrors.pickup_location;
        }
        break;

      case 'destination':
        if (!value.trim()) {
          newErrors.destination = 'Destination is required';
        } else if (value.trim().length < 3) {
          newErrors.destination = 'Destination must be at least 3 characters';
        } else {
          delete newErrors.destination;
        }
        break;

      case 'phone':
        if (!value || value.length < 4) {
          newErrors.phone = 'Phone number is required';
        } else if (value.replace(/\D/g, '').length < 7) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'schedule_time':
        if (formData.is_scheduled && !value) {
          newErrors.schedule_time = 'Schedule time is required when booking for later';
        } else if (formData.is_scheduled && value) {
          const selectedTime = new Date(value);
          const now = new Date();
          if (selectedTime <= now) {
            newErrors.schedule_time = 'Schedule time must be in the future';
          } else {
            delete newErrors.schedule_time;
          }
        } else {
          delete newErrors.schedule_time;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
      // Clear schedule_time if switching to immediate booking
      ...(name === 'is_scheduled' && !checked && { schedule_time: '' })
    }));

    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const getCurrentLocation = async () => {
    if (!geolocationService.isGeolocationSupported()) {
      setLocationError(new Error('NOT_SUPPORTED'));
      setShowLocationFallback(true);
      return;
    }

    setIsLocationLoading(true);
    setLocationError(null);
    setShowLocationFallback(false);

    try {
      const position = await geolocationService.getCurrentPosition({
        timeout: 15000,
        maxRetries: 2
      });
      
      const { latitude, longitude } = position.coords;
      const accuracy = geolocationService.getAccuracyInfo(position);
      
      // Reverse geocode to get a readable address
      let locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.display_name) {
            locationString = data.display_name;
          }
        }
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed, using coordinates:', geocodeError);
      }
      
      setFormData(prev => ({
        ...prev,
        pickup_location: locationString
      }));
      
      setSubmitStatus({
        type: 'success',
        message: `Location found with ${accuracy.toLowerCase()}. You can edit it if needed.`
      });
      
      setIsLocationLoading(false);
      setRetryCount(0);
      
    } catch (error) {
      console.error('Geolocation error:', error);
      setLocationError(error);
      setShowLocationFallback(true);
      setIsLocationLoading(false);
    }
  };

  const handleLocationRetry = () => {
    setRetryCount(prev => prev + 1);
    getCurrentLocation();
  };

  const handleManualLocationInput = (location) => {
    setFormData(prev => ({
      ...prev,
      pickup_location: location
    }));
    setShowLocationFallback(false);
    setLocationError(null);
  };

  const handleDismissLocationFallback = () => {
    setShowLocationFallback(false);
    setLocationError(null);
  };

  const validateForm = () => {
    // Mark all fields as touched on submit
    setTouched({
      pickup_location: true,
      destination: true,
      phone: true,
      schedule_time: true,
    });
    
    const newErrors = {};

    // Validate all required fields
    if (!formData.pickup_location.trim()) {
      newErrors.pickup_location = 'Pickup location is required';
    }
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    if (!formData.phone || formData.phone.length < 4) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.is_scheduled && !formData.schedule_time) {
      newErrors.schedule_time = 'Schedule time is required when booking for later';
    }

    // Validate phone number format
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate schedule time is in future
    if (formData.is_scheduled && formData.schedule_time) {
      const selectedTime = new Date(formData.schedule_time);
      const now = new Date();
      if (selectedTime <= now) {
        newErrors.schedule_time = 'Schedule time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      // Extract country code and phone number from the combined phone value
      const phoneDigits = formData.phone.replace(/\D/g, '');
      // The library stores as country code + number (e.g., "11234567890" for US +1)
      // We need to split it - use a simple heuristic
      const countryCode = '+' + (formData.phoneCountryCode || '1');
      const phoneNumber = phoneDigits.slice((formData.phoneCountryCode || '1').length);

      const submitData = {
        pickup_location: formData.pickup_location,
        destination: formData.destination,
        country_code: countryCode,
        phone_number: phoneNumber,
        passengers: formData.passengers,
        bags: formData.bags === '5+' ? 5 : parseInt(formData.bags),
        is_scheduled: formData.is_scheduled,
        ...(formData.is_scheduled && { schedule_time: formData.schedule_time }),
      };

      // Use retry mechanism for booking submission
      await withRetry(
        () => publicAPI.createRide(submitData),
        { maxRetries: 2, retryDelay: 1000 }
      );
      
      setSubmitStatus({
        type: 'success',
        message: 'Booking submitted successfully! You will receive a confirmation shortly.'
      });

      // Reset form after successful submission
      setFormData({
        pickup_location: '',
        destination: '',
        phone: '',
        passengers: 1,
        bags: 0,
        schedule_time: '',
        is_scheduled: false,
      });
      setErrors({});
      setTouched({});

    } catch (error) {
      console.error('Booking submission error:', error);
      
      let errorMessage = 'Failed to submit booking. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Please check your information and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get minimum datetime for scheduling (current time + 30 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="booking-form-container">
      <form onSubmit={handleSubmit} className="booking-form">
        <h2 className="form-title">Book Your Ride</h2>
        
        {/* Pickup Location */}
        <div className="form-group">
          <label htmlFor="pickup_location" className="form-label">
            Pickup Location *
          </label>
          <div className="location-input-group">
            <input
              type="text"
              id="pickup_location"
              name="pickup_location"
              value={formData.pickup_location}
              onChange={handleInputChange}
              className={`form-input ${errors.pickup_location ? 'error' : ''}`}
              placeholder="Enter pickup location"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLocationLoading || isLoading}
              className="location-btn"
              variant="outline"
              aria-label="Use current location"
            >
              {isLocationLoading ? <LoadingSpinner size="small" showText={false} /> : '📍'}
            </Button>
          </div>
          {errors.pickup_location && (
            <ErrorMessage message={errors.pickup_location} />
          )}
          {showLocationFallback && locationError && (
            <GeolocationFallback
              error={locationError}
              onRetry={handleLocationRetry}
              onManualInput={handleManualLocationInput}
              onDismiss={handleDismissLocationFallback}
              isRetrying={isLocationLoading}
            />
          )}
        </div>

        {/* Destination */}
        <div className="form-group">
          <label htmlFor="destination" className="form-label">
            Destination *
          </label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleInputChange}
            className={`form-input ${errors.destination ? 'error' : ''}`}
            placeholder="Enter destination"
            disabled={isLoading}
          />
          {errors.destination && (
            <ErrorMessage message={errors.destination} />
          )}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone_number" className="form-label">
            Phone Number *
          </label>
          <PhoneInput
            country={'us'}
            value={formData.phone}
            onChange={(value, countryData) => {
              setFormData(prev => ({
                ...prev,
                phone: value,
                phoneCountryCode: countryData.dialCode
              }));
              if (!touched.phone) {
                setTouched(prev => ({ ...prev, phone: true }));
              }
              if (submitStatus) setSubmitStatus(null);
            }}
            inputClass={`phone-lib-input ${errors.phone ? 'error' : ''}`}
            containerClass="phone-lib-container"
            buttonClass="phone-lib-button"
            dropdownClass="phone-lib-dropdown"
            searchClass="phone-lib-search"
            disabled={isLoading}
            enableSearch
            searchPlaceholder="Search country..."
            inputProps={{
              id: 'phone_number',
              name: 'phone_number',
            }}
          />
          {touched.phone && errors.phone && (
            <ErrorMessage message={errors.phone} />
          )}
        </div>

        {/* Passengers and Bags */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="passengers" className="form-label">
              Passengers
            </label>
            <select
              id="passengers"
              value={formData.passengers}
              onChange={(e) => handleSelectChange('passengers', parseInt(e.target.value))}
              className="form-select"
              disabled={isLoading}
            >
              {PASSENGER_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'passenger' : 'passengers'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bags" className="form-label">
              Bags
            </label>
            <select
              id="bags"
              value={formData.bags}
              onChange={(e) => handleSelectChange('bags', e.target.value)}
              className="form-select"
              disabled={isLoading}
            >
              {BAG_OPTIONS.map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'bag' : 'bags'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Option */}
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="is_scheduled"
              name="is_scheduled"
              checked={formData.is_scheduled}
              onChange={handleInputChange}
              className="form-checkbox"
              disabled={isLoading}
            />
            <label htmlFor="is_scheduled" className="checkbox-label">
              Schedule for later
            </label>
          </div>
        </div>

        {/* Schedule Time */}
        {formData.is_scheduled && (
          <div className="form-group">
            <label htmlFor="schedule_time" className="form-label">
              Schedule Time *
            </label>
            <input
              type="datetime-local"
              id="schedule_time"
              name="schedule_time"
              value={formData.schedule_time}
              onChange={handleInputChange}
              min={getMinDateTime()}
              className={`form-input ${errors.schedule_time ? 'error' : ''}`}
              disabled={isLoading}
            />
            {errors.schedule_time && (
              <ErrorMessage message={errors.schedule_time} />
            )}
          </div>
        )}

        {/* Submit Status Messages */}
        {submitStatus && (
          <div className="form-group">
            {submitStatus.type === 'success' ? (
              <SuccessMessage message={submitStatus.message} />
            ) : (
              <ErrorMessage message={submitStatus.message} />
            )}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-group">
          <Button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className="submit-btn"
            variant="primary"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Submitting...
              </>
            ) : (
              'Book Ride'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;