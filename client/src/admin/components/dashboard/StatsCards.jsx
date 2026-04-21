import React from 'react';
import './StatsCards.css';

const StatsCards = ({ analytics, loading }) => {
  const stats = [
    {
      title: 'Total Earnings',
      value: analytics?.total_earnings ? `$${analytics.total_earnings.toFixed(2)}` : '$0.00',
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Total Rides',
      value: analytics?.total_rides || 0,
      icon: '🚗',
      color: 'blue'
    },
    {
      title: 'Completed Rides',
      value: analytics?.completed_rides || 0,
      icon: '✅',
      color: 'success'
    },
    {
      title: 'Pending Rides',
      value: analytics?.pending_rides || 0,
      icon: '⏳',
      color: 'warning'
    }
  ];

  if (loading) {
    return (
      <div className="stats-cards">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card loading">
            <div className="stat-card-content">
              <div className="stat-icon skeleton"></div>
              <div className="stat-info">
                <div className="stat-title skeleton"></div>
                <div className="stat-value skeleton"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-cards">
      {stats.map((stat, index) => (
        <div key={index} className={`stat-card ${stat.color}`}>
          <div className="stat-card-content">
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;