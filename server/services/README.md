# Notification Services

This directory contains the notification services for the Ryde taxi booking application.

## Services Overview

### EmailService (`emailService.js`)
Handles email notifications using Node Mailer with SMTP configuration.

**Features:**
- Booking confirmation emails to admin
- Contact form submission emails
- HTML and text email templates
- SMTP connection testing
- Error handling and retry mechanisms

**Configuration:**
Set the following environment variables in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@ryde.com
FROM_NAME=Ryde Taxi Service
ADMIN_EMAIL=admin@ryde.com
```

### WhatsAppService (`whatsappService.js`)
Handles WhatsApp notifications using WhatsApp Business API integration.

**Features:**
- Booking notification messages to admin
- Phone number validation and formatting
- WhatsApp Web URL generation
- API connection testing
- Fallback to logging when API is not configured

**Configuration:**
Set the following environment variables in `.env`:
```
WHATSAPP_API_URL=https://api.whatsapp.com/send
WHATSAPP_PHONE_NUMBER=your_whatsapp_number
WHATSAPP_API_TOKEN=your_whatsapp_api_token
ADMIN_PHONE=+1234567890
```

### NotificationService (`notificationService.js`)
Orchestrates both email and WhatsApp notifications.

**Features:**
- Combined notification sending
- Individual service error handling
- Retry mechanisms with exponential backoff
- Service health checking
- Failed notification queuing (basic implementation)

## Usage Examples

### Sending Booking Notifications
```javascript
const notificationService = require('./services/notificationService');

const bookingData = {
    id: 1,
    pickup_location: '123 Main St',
    destination: '456 Oak Ave',
    country_code: '+1',
    phone_number: '1234567890',
    passengers: 2,
    bags: 1,
    is_scheduled: false,
    status: 'booked'
};

const result = await notificationService.sendBookingNotifications(bookingData);
console.log('Notification result:', result);
```

### Sending Contact Form Notifications
```javascript
const contactData = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subject: 'Inquiry',
    message: 'I need a ride tomorrow.'
};

const result = await notificationService.sendContactFormNotification(contactData);
console.log('Contact notification result:', result);
```

### Testing Service Connections
```javascript
const testResults = await notificationService.testServices();
console.log('Email service:', testResults.email);
console.log('WhatsApp service:', testResults.whatsapp);
console.log('Overall status:', testResults.overall);
```

## Testing

Run the notification service tests:
```bash
npm test -- --testPathPattern="emailService|whatsappService|notificationService"
```

Test the services manually:
```bash
node scripts/test-notifications.js
```

## Error Handling

All services implement comprehensive error handling:

- **Email Service**: Handles SMTP connection errors, authentication failures, and sending errors
- **WhatsApp Service**: Handles API timeouts, authentication errors, and network failures
- **Notification Service**: Provides fallback mechanisms and retry logic

## Development vs Production

### Development
- Email service will show "transporter not initialized" if SMTP is not configured
- WhatsApp service will log messages instead of sending if API is not configured
- Both behaviors are expected and normal for development

### Production
- Ensure all environment variables are properly configured
- Test service connections before deployment
- Monitor notification delivery and error rates
- Implement proper queue system for failed notifications

## Security Considerations

- SMTP credentials are stored in environment variables
- WhatsApp API tokens are secured
- Input validation is performed on all notification data
- Rate limiting should be implemented for notification endpoints
- Sensitive information is not logged in production

## Performance

- Connection pooling is used for SMTP
- Async/await pattern for non-blocking operations
- Timeout configurations prevent hanging requests
- Retry mechanisms with exponential backoff
- Basic queuing system for failed notifications

## Monitoring

Monitor the following metrics:
- Email delivery success rate
- WhatsApp delivery success rate
- Average notification processing time
- Failed notification queue size
- SMTP connection health
- WhatsApp API response times