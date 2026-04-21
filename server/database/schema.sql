-- Ryde Taxi Booking Database Schema

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Rides table for storing ride bookings
CREATE TABLE IF NOT EXISTS rides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    passengers INT NOT NULL CHECK (passengers BETWEEN 1 AND 8),
    bags INT NOT NULL CHECK (bags >= 0),
    schedule_time DATETIME NULL,
    is_scheduled BOOLEAN DEFAULT FALSE,
    status ENUM('booked', 'in_progress', 'completed') DEFAULT 'booked',
    price DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_schedule_time (schedule_time),
    INDEX idx_phone (phone_number)
);

-- Insert default admin user (password: admin123 - should be changed in production)
INSERT IGNORE INTO users (email, password, role) 
VALUES ('admin@ryde.com', '$2a$12$pOE6AQMMX1.b61bSbXxw3OZj29Of0uhJPiJLlTSdn.L/TK6Jh//j6', 'admin');