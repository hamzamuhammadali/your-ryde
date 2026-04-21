import React, { useMemo } from 'react';
import './EarningsChart.css';

const EarningsChart = ({ analytics, loading, period }) => {
  // Generate mock chart data based on period
  const chartData = useMemo(() => {
    if (!analytics?.earnings_data || analytics.earnings_data.length === 0) {
      // Generate sample data for visualization
      const days = period === '7days' ? 7 : period === '1month' ? 30 : period === '6months' ? 180 : 365;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate random earnings for demo
        const earnings = Math.random() * 500 + 100;
        
        data.push({
          date: date.toISOString().split('T')[0],
          earnings: earnings,
          rides: Math.floor(Math.random() * 10) + 1
        });
      }
      
      return data;
    }
    
    return analytics.earnings_data;
  }, [analytics, period]);

  const maxEarnings = useMemo(() => {
    return Math.max(...chartData.map(d => d.earnings), 100);
  }, [chartData]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (period === '7days') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (period === '1month') {
      return date.getDate().toString();
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(0)}`;
  };

  if (loading) {
    return (
      <div className="earnings-chart">
        <div className="chart-header">
          <h3>Earnings Overview</h3>
        </div>
        <div className="chart-container loading">
          <div className="chart-skeleton">
            <div className="skeleton-bars">
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="skeleton-bar" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-chart">
      <div className="chart-header">
        <h3>Earnings Overview</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color earnings"></div>
            <span>Earnings</span>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <div className="chart-y-axis">
          {[100, 75, 50, 25, 0].map(percent => (
            <div key={percent} className="y-axis-label">
              {formatCurrency((maxEarnings * percent) / 100)}
            </div>
          ))}
        </div>
        
        <div className="chart-content">
          <div className="chart-grid">
            {[0, 25, 50, 75, 100].map(percent => (
              <div key={percent} className="grid-line" style={{ bottom: `${percent}%` }}></div>
            ))}
          </div>
          
          <div className="chart-bars">
            {chartData.map((data, index) => {
              const height = (data.earnings / maxEarnings) * 100;
              return (
                <div key={index} className="bar-container">
                  <div 
                    className="chart-bar earnings"
                    style={{ height: `${height}%` }}
                    title={`${formatDate(data.date)}: ${formatCurrency(data.earnings)} (${data.rides} rides)`}
                  >
                    <div className="bar-value">{formatCurrency(data.earnings)}</div>
                  </div>
                  <div className="bar-label">{formatDate(data.date)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Earnings:</span>
          <span className="summary-value">{formatCurrency(chartData.reduce((sum, d) => sum + d.earnings, 0))}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average per Day:</span>
          <span className="summary-value">{formatCurrency(chartData.reduce((sum, d) => sum + d.earnings, 0) / chartData.length)}</span>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;