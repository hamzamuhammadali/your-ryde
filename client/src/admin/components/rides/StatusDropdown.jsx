import React, { useState } from 'react';
import './StatusDropdown.css';

const StatusDropdown = ({ currentStatus, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions = [
    { value: 'booked', label: 'Booked', color: '#fbbf24' },
    { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { value: 'completed', label: 'Completed', color: '#10b981' }
  ];

  const getCurrentStatusOption = () => {
    return statusOptions.find(option => option.value === currentStatus) || statusOptions[0];
  };

  const handleStatusSelect = (status) => {
    if (status !== currentStatus && !disabled) {
      onStatusChange(status);
    }
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        setIsOpen(!isOpen);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      default:
        break;
    }
  };

  const currentOption = getCurrentStatusOption();

  return (
    <div className={`status-dropdown ${disabled ? 'disabled' : ''}`}>
      <button
        className={`status-dropdown-trigger status-${currentStatus}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Current status: ${currentOption.label}. Click to change status.`}
      >
        <span 
          className="status-indicator"
          style={{ backgroundColor: currentOption.color }}
        ></span>
        <span className="status-text">{currentOption.label}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="status-dropdown-menu" role="listbox">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`status-option status-${option.value} ${
                option.value === currentStatus ? 'selected' : ''
              }`}
              onClick={() => handleStatusSelect(option.value)}
              role="option"
              aria-selected={option.value === currentStatus}
            >
              <span 
                className="status-indicator"
                style={{ backgroundColor: option.color }}
              ></span>
              <span className="status-text">{option.label}</span>
              {option.value === currentStatus && (
                <span className="selected-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="status-dropdown-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default StatusDropdown;