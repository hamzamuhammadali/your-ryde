# Ryde - Taxi Booking Web Application

A full-stack web application for taxi booking built with React.js, Node.js, Express.js, and MySQL.

## Features

- Customer ride booking through web interface
- Admin dashboard for ride management
- Email and WhatsApp notifications
- Analytics and earnings tracking
- Responsive design with mobile support

## Technology Stack

- **Frontend**: React.js, React Router, Styled Components
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT with bcrypt
- **Notifications**: Node Mailer (SMTP), WhatsApp API
- **Other**: Geolocation API, Rate limiting, Security middleware

## Project Structure

```
ryde-taxi-booking/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── admin/          # Admin dashboard
│   │   └── services/       # API services
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ryde-taxi-booking
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Database Setup**
   - Create a MySQL database named `ryde_app`
   - Update database credentials in `server/.env`

4. **Environment Configuration**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Start Development Servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:dev` - Start only backend server
- `npm run client:dev` - Start only frontend server
- `npm run client:build` - Build frontend for production
- `npm test` - Run tests for both frontend and backend

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ryde_app
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@ryde.com
FROM_NAME=Ryde Taxi Service

# WhatsApp API Configuration
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_PHONE_NUMBER=your_whatsapp_number
WHATSAPP_API_TOKEN=your_whatsapp_api_token

# Admin Configuration
ADMIN_EMAIL=admin@ryde.com
ADMIN_PHONE=+1234567890
```

## API Endpoints

### Public Endpoints
- `POST /api/public/rides` - Create new ride booking
- `GET /api/public/rides/:id` - Get ride status
- `POST /api/contact` - Submit contact form

### Admin Endpoints
- `POST /api/admin/auth/login` - Admin authentication
- `GET /api/admin/rides` - Get all rides with pagination
- `PUT /api/admin/rides/:id/status` - Update ride status
- `PUT /api/admin/rides/:id/price` - Update ride price
- `GET /api/admin/analytics` - Get earnings analytics

## Development Status

This project is currently in development. The basic project structure has been set up with:

✅ Project structure and configuration
✅ Basic React frontend with routing
✅ Express.js backend with middleware
✅ Database configuration
✅ Environment setup

**Next Steps:**
- Implement database models and schema
- Build authentication system
- Create ride booking functionality
- Develop admin dashboard
- Add notification services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.