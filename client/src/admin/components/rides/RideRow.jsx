import React, { useState } from 'react';
import StatusDropdown from './StatusDropdown';
import './RideRow.css';

const RideRow = ({ ride, onStatusUpdate, onPriceUpdate }) => {
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState(ride.price || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPhone = (countryCode, phoneNumber) => {
    return `${countryCode} ${phoneNumber}`;
  };

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    await onStatusUpdate(ride.id, newStatus);
    setIsUpdating(false);
  };

  const handlePriceEdit = () => {
    setIsEditingPrice(true);
    setPriceValue(ride.price || '');
  };

  const handlePriceSave = async () => {
    if (priceValue === '' || isNaN(priceValue) || parseFloat(priceValue) < 0) {
      alert('Please enter a valid price');
      return;
    }

    setIsUpdating(true);
    await onPriceUpdate(ride.id, parseFloat(priceValue));
    setIsEditingPrice(false);
    setIsUpdating(false);
  };

  const handlePriceCancel = () => {
    setIsEditingPrice(false);
    setPriceValue(ride.price || '');
  };

  const handlePriceKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePriceSave();
    } else if (e.key === 'Escape') {
      handlePriceCancel();
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'booked':
        return 'status-badge status-booked';
      case 'in_progress':
        return 'status-badge status-in-progress';
      case 'completed':
        return 'status-badge status-completed';
      default:
        return 'status-badge';
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className={`ride-row ${isUpdating ? 'updating' : ''}`}>
      <div className="cell ride-id">#{ride.id}</div>
      
      <div className="cell pickup-location" title={ride.pickup_location}>
        {truncateText(ride.pickup_location)}
      </div>
      
      <div className="cell destination" title={ride.destination}>
        {truncateText(ride.destination)}
      </div>
      
      <div className="cell phone">
        {formatPhone(ride.country_code, ride.phone_number)}
      </div>
      
      <div className="cell passengers">
        {ride.passengers} {ride.passengers === 1 ? 'person' : 'people'}
        {ride.bags > 0 && (
          <span className="bags-info">
            <br />
            {ride.bags} {ride.bags === 1 ? 'bag' : 'bags'}
          </span>
        )}
      </div>
      
      <div className="cell schedule">
        {ride.is_scheduled ? (
          <div className="scheduled">
            <span className="schedule-label">Scheduled:</span>
            <br />
            {formatDate(ride.schedule_time)}
          </div>
        ) : (
          <span className="immediate">Immediate</span>
        )}
      </div>
      
      <div className="cell status">
        <StatusDropdown
          currentStatus={ride.status}
          onStatusChange={handleStatusChange}
          disabled={isUpdating}
        />
      </div>
      
      <div className="cell price">
        {isEditingPrice ? (
          <div className="price-edit">
            <input
              type="number"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              onKeyDown={handlePriceKeyPress}
              className="price-input"
              placeholder="0.00"
              min="0"
              step="0.01"
              autoFocus
            />
            <div className="price-actions">
              <button 
                onClick={handlePriceSave}
                className="save-btn"
                disabled={isUpdating}
              >
                ✓
              </button>
              <button 
                onClick={handlePriceCancel}
                className="cancel-btn"
                disabled={isUpdating}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="price-display">
            <span className="price-value">
              {ride.price ? `$${parseFloat(ride.price).toFixed(2)}` : 'Not set'}
            </span>
            <button 
              onClick={handlePriceEdit}
              className="edit-price-btn"
              disabled={isUpdating}
              title="Edit price"
            >
              ✏️
            </button>
          </div>
        )}
      </div>
      
      <div className="cell created-date">
        {formatDate(ride.created_at)}
      </div>
      
      <div className="cell actions">
        <div className="action-buttons">
          <button 
            className="view-btn"
            title="View details"
            onClick={() => {
              // Future enhancement: open ride details modal
              console.log('View ride details:', ride.id);
            }}
          >
            👁️
          </button>
        </div>
      </div>
      
      {isUpdating && (
        <div className="updating-overlay">
          <div className="updating-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default RideRow;