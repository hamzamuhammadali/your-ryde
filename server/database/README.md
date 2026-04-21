# Database Implementation

This directory contains the complete database implementation for the Ryde taxi booking application, including models, schema, utilities, and migration scripts.

## Structure

```
database/
├── schema.sql          # Database schema with tables and indexes
├── init.js            # Database initialization utilities
├── utils.js           # Database utility functions
├── index.js           # Main database exports
├── test-models.js     # Model testing script (requires MySQL)
├── validate-models.js # Model structure validation
└── README.md          # This file

models/
├── User.js            # User model with authentication
└── Ride.js            # Ride model with booking logic

scripts/
└── migrate.js         # Database migration script
```

## Features Implemented

### ✅ Database Schema
- **Users table**: Admin authentication with bcrypt password hashing
- **Rides table**: Complete ride booking data with proper constraints
- **Indexes**: Performance optimization on frequently queried fields
- **Constraints**: Data validation at database level

### ✅ Connection Management
- **Connection pooling**: Efficient database connection management
- **Error handling**: Robust connection error handling
- **Configuration**: Environment-based database configuration

### ✅ User Model
- `create()` - Create new admin user with password hashing
- `findById()` - Find user by ID
- `findByEmail()` - Find user by email (for login)
- `findAll()` - Get all users
- `update()` - Update user information
- `delete()` - Delete user
- `verifyPassword()` - Password verification for authentication
- `toJSON()` - Safe serialization (excludes password)

### ✅ Ride Model
- `create()` - Create new ride booking with validation
- `findById()` - Find ride by ID
- `findAll()` - Get rides with pagination and filtering
- `update()` - Update ride status, price, etc.
- `delete()` - Delete ride
- `findByStatus()` - Filter rides by status
- `findByPhoneNumber()` - Find rides by customer phone
- `getAnalytics()` - Generate analytics data for admin dashboard

### ✅ Database Utilities
- `executeQuery()` - Execute raw SQL queries
- `beginTransaction()` - Start database transaction
- `commitTransaction()` - Commit transaction
- `rollbackTransaction()` - Rollback transaction
- `tableExists()` - Check if table exists
- `getTableRowCount()` - Get row count for table
- `truncateTable()` - Clear table data
- `getPoolStats()` - Connection pool statistics
- `closePool()` - Close all connections

## Usage

### Setup Database
```bash
# Run database migration
npm run migrate

# Validate model structure
npm run validate-models

# Test models (requires MySQL connection)
npm run test-models
```

### Using Models in Code
```javascript
const { User, Ride } = require('./database');

// Create a ride booking
const ride = await Ride.create({
  pickup_location: '123 Main St',
  destination: '456 Oak Ave',
  country_code: '+1',
  phone_number: '1234567890',
  passengers: 2,
  bags: 1
});

// Find user for authentication
const user = await User.findByEmail('admin@ryde.com');
const isValid = await user.verifyPassword('password');

// Get rides with pagination
const { rides, pagination } = await Ride.findAll({
  page: 1,
  limit: 10,
  status: 'booked'
});
```

## Database Schema Details

### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

### Rides Table
```sql
CREATE TABLE rides (
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
```

## Performance Optimizations

1. **Connection Pooling**: Reuses database connections for better performance
2. **Indexes**: Strategic indexes on frequently queried columns
3. **Pagination**: Built-in pagination support for large datasets
4. **Query Optimization**: Efficient queries with proper WHERE clauses
5. **Transaction Support**: ACID compliance for data integrity

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds of 12
2. **Input Validation**: Server-side validation in models
3. **SQL Injection Prevention**: Parameterized queries
4. **Data Constraints**: Database-level validation rules

## Requirements Satisfied

- ✅ **Requirement 6.3**: MySQL database implementation
- ✅ **Requirement 5.5**: Data integrity and consistency
- ✅ Connection pooling for performance
- ✅ Proper indexing for optimization
- ✅ CRUD operations for all entities
- ✅ Analytics support for admin dashboard

## Default Admin User

The migration creates a default admin user:
- **Email**: admin@ryde.com
- **Password**: admin123
- ⚠️ **Important**: Change this password in production!

## Testing

Run the validation script to verify model structure:
```bash
npm run validate-models
```

For full testing with database connection:
```bash
npm run test-models
```

This implementation provides a solid foundation for the Ryde application's data layer with proper security, performance, and maintainability considerations.