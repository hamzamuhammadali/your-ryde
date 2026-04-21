import React, { useState, useEffect } from 'react';
import { rideService } from '../../services/adminApi';
import RideRow from './RideRow';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import './RideTable.css';

const RideTable = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRides, setTotalRides] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  const RIDES_PER_PAGE = 10;

  useEffect(() => {
    fetchRides();
  }, [currentPage, filters]);

  const fetchRides = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await rideService.getAllRides(currentPage, RIDES_PER_PAGE, filters);
      
      if (result.success) {
        const responseData = result.data?.data || result.data;
        setRides(responseData.rides || []);
        setTotalPages(responseData.pagination?.totalPages || 1);
        setTotalRides(responseData.pagination?.total || 0);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch rides');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (rideId, newStatus) => {
    try {
      const result = await rideService.updateStatus(rideId, newStatus);
      
      if (result.success) {
        // Update the ride in the local state
        setRides(prevRides => 
          prevRides.map(ride => 
            ride.id === rideId 
              ? { ...ride, status: newStatus, updated_at: new Date().toISOString() }
              : ride
          )
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update ride status');
    }
  };

  const handlePriceUpdate = async (rideId, newPrice) => {
    try {
      const result = await rideService.updatePrice(rideId, newPrice);
      
      if (result.success) {
        // Update the ride in the local state
        setRides(prevRides => 
          prevRides.map(ride => 
            ride.id === rideId 
              ? { ...ride, price: newPrice, updated_at: new Date().toISOString() }
              : ride
          )
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update ride price');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    );

    return pages;
  };

  if (loading) {
    return (
      <div className="ride-table-loading">
        <LoadingSpinner />
        <p>Loading rides...</p>
      </div>
    );
  }

  return (
    <div className="ride-table-container">
      <div className="ride-table-header">
        <h2>Ride Management</h2>
        <div className="ride-table-filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="search-filter">Search:</label>
            <input
              id="search-filter"
              type="text"
              placeholder="Search by phone or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchRides} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="ride-table-info">
        <p>Total rides: {totalRides} | Page {currentPage} of {totalPages}</p>
      </div>

      {rides.length === 0 ? (
        <div className="no-rides">
          <p>No rides found.</p>
        </div>
      ) : (
        <>
          <div className="ride-table">
            <div className="ride-table-header-row">
              <div className="header-cell">ID</div>
              <div className="header-cell">Pickup</div>
              <div className="header-cell">Destination</div>
              <div className="header-cell">Phone</div>
              <div className="header-cell">Passengers</div>
              <div className="header-cell">Schedule</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Price</div>
              <div className="header-cell">Created</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {rides.map((ride) => (
              <RideRow
                key={ride.id}
                ride={ride}
                onStatusUpdate={handleStatusUpdate}
                onPriceUpdate={handlePriceUpdate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RideTable;