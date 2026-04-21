import React, { useState, useEffect } from 'react';
import StatsCards from '../components/dashboard/StatsCards';
import EarningsChart from '../components/dashboard/EarningsChart';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import { analyticsService } from '../services/adminApi';
import './Dashboard.css';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  const fetchAnalytics = async (period) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyticsService.getAnalytics(period);
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    fetchAnalytics(selectedPeriod);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard Overview</h1>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '↻' : '⟳'} Refresh
          </button>
        </div>
        <p className="dashboard-subtitle">
          Monitor your taxi booking business performance and analytics
        </p>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      )}

      <DateRangeFilter 
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        loading={loading}
      />

      <StatsCards 
        analytics={analytics}
        loading={loading}
      />

      <EarningsChart 
        analytics={analytics}
        loading={loading}
        period={selectedPeriod}
      />
    </div>
  );
};

export default AdminDashboard;