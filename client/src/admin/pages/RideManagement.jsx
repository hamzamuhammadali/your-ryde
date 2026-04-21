import React from 'react';
import RideTable from '../components/rides/RideTable';
import './RideManagement.css';

const RideManagement = () => {
  return (
    <div className="ride-management">
      <div className="ride-management-container">
        <RideTable />
      </div>
    </div>
  );
};

export default RideManagement;