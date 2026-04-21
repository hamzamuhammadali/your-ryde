import React from 'react';
import './DateRangeFilter.css';

const DateRangeFilter = ({ selectedPeriod, onPeriodChange, loading }) => {
  const periods = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '1month', label: 'Last 1 Month' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last 1 Year' }
  ];

  return (
    <div className="date-range-filter">
      <label className="filter-label">Time Period:</label>
      <div className="filter-buttons">
        {periods.map((period) => (
          <button
            key={period.value}
            className={`filter-button ${selectedPeriod === period.value ? 'active' : ''}`}
            onClick={() => onPeriodChange(period.value)}
            disabled={loading}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter;