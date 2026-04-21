# Authentication System Documentation

## Overview

The Ryde taxi booking application implements a JWT-based authentication system for admin users. The system provides secure login, token refresh, and session management capabilities.

## Features

- **JWT Authentication**: Access tokens with 24-hour expiration
- **Refresh Tokens**: Long-lived tokens (7 days) for seamless token renewal
- **Password Security**: bcrypt hashing with salt rounds of 12
- **Role-based Access**: Admin-only access to protected routes
- **Session Management**: HTTP-only cookies for refresh tokens
- **Input Validation**: Comprehensive validation for all authentication endpoints

## API Endpoints

### Authentication Routes

#### POST /api/admin/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@ryde.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@ryde.com",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### POST /api/admin/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "admin@ryde.com",
      "role": "admin"
    }
  }
}
```

#### POST /api/admin/auth/logout
Logout and clear refresh token cookie.

**Response (Success):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /api/admin/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@ryde.com",
      "role": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## Middleware

### authenticateToken
Verifies JWT access tokens and attaches user to request object.

**Usage:**
```javascript
const { authenticateToken } = require('../middleware/auth');
router.use(authenticateToken);
```

### requireAdmin
Ensures authenticated user has admin role.

**Usage:**
```javascript
const { requireAdmin } = require('../middleware/auth');
router.use(authenticateToken);
router.use(requireAdmin);
```

## Environment Variables

Required environment variables for authentication:

```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_here
JWT_REFRESH_EXPIRES_IN=7d
```

## Security Features

### Password Hashing
- Uses bcrypt with 12 salt rounds
- Passwords are never stored in plain text
- Automatic hashing on user creation and updates

### Token Security
- Access tokens expire in 24 hours
- Refresh tokens expire in 7 days
- Refresh tokens stored as HTTP-only cookies
- Secure cookies in production environment

### Input Validation
- Email format validation
- Password minimum length (6 characters)
- Request sanitization and validation

### Error Handling
- Generic error messages to prevent information leakage
- Proper HTTP status codes
- Detailed logging for debugging

## Usage Examples

### Creating an Admin User
```bash
npm run create-admin
```

### Frontend Authentication Flow
```javascript
// Login
const response = await fetch('/api/admin/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@ryde.com',
    password: 'password123'
  }),
  credentials: 'include' // Include cookies
});

const data = await response.json();
const accessToken = data.data.accessToken;

// Use token for authenticated requests
const protectedResponse = await fetch('/api/admin/rides', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when needed
const refreshResponse = await fetch('/api/admin/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Refresh token from cookie
});
```

## Testing

The authentication system includes comprehensive unit tests covering:

- JWT token generation and verification
- Login endpoint with various scenarios
- Token refresh functionality
- Protected route access
- Password hashing and verification
- User model authentication methods

Run tests:
```bash
npm test
```

Run specific authentication tests:
```bash
npm test -- --testPathPattern=auth.test.js
npm test -- --testPathPattern=user.test.js
```

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Validation failed | Invalid input data |
| 401 | Access token required | Missing authorization header |
| 401 | Invalid token | Malformed or invalid JWT |
| 401 | Token expired | JWT has expired |
| 401 | Invalid email or password | Login credentials incorrect |
| 403 | Admin access required | User lacks admin privileges |
| 500 | Authentication failed | Server error during auth |

## Security Considerations

1. **Environment Variables**: Keep JWT secrets secure and use strong, random values
2. **HTTPS**: Always use HTTPS in production for token transmission
3. **Token Storage**: Store access tokens securely on the client side
4. **Refresh Token Rotation**: Consider implementing refresh token rotation for enhanced security
5. **Rate Limiting**: API endpoints are protected by rate limiting middleware
6. **CORS**: Properly configured CORS for allowed origins only