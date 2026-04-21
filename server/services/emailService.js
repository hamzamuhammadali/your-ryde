const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    initializeTransporter() {
        try {
            // Skip initialization in test environment or if SMTP is not configured
            if (process.env.NODE_ENV === 'test' || !config.smtp.host) {
                console.log('📧 Email service disabled (test mode or SMTP not configured)');
                return;
            }

            this.transporter = nodemailer.createTransport({
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.port === 465, // true for 465, false for other ports
                auth: {
                    user: config.smtp.user,
                    pass: config.smtp.pass
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify connection configuration
            this.transporter.verify((error, success) => {
                if (error) {
                    console.warn('⚠️  SMTP connection error:', error.message);
                    console.log('📧 Email service will continue without SMTP (development mode)');
                } else {
                    console.log('✅ SMTP server is ready to take our messages');
                }
            });
        } catch (error) {
            console.warn('⚠️  Failed to initialize email transporter:', error.message);
            console.log('📧 Email service will continue without SMTP (development mode)');
            // Don't throw error in development - just log it
            if (process.env.NODE_ENV === 'production') {
                throw new Error('Email service initialization failed');
            }
        }
    }

    async sendBookingConfirmation(bookingData) {
        try {
            // Check if transporter is available
            if (!this.transporter) {
                console.log('📧 Email transporter not available - skipping booking confirmation email');
                return {
                    success: true,
                    messageId: 'skipped-no-transporter',
                    message: 'Email skipped - no transporter configured'
                };
            }

            const mailOptions = {
                from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
                to: config.admin.email,
                subject: 'New Ride Booking - Ryde Taxi Service',
                html: this.generateBookingEmailTemplate(bookingData),
                text: this.generateBookingTextTemplate(bookingData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Booking confirmation email sent:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('❌ Failed to send booking confirmation email:', error.message);
            // Don't throw error in development - just log it
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Email sending failed: ${error.message}`);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendContactFormEmail(contactData) {
        try {
            // Check if transporter is available
            if (!this.transporter) {
                console.log('📧 Email transporter not available - skipping contact form email');
                return {
                    success: true,
                    messageId: 'skipped-no-transporter',
                    message: 'Email skipped - no transporter configured'
                };
            }

            const mailOptions = {
                from: `${config.smtp.fromName} <${config.smtp.fromEmail}>`,
                to: config.admin.email,
                subject: 'New Contact Form Submission - Ryde Taxi Service',
                html: this.generateContactEmailTemplate(contactData),
                text: this.generateContactTextTemplate(contactData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Contact form email sent:', result.messageId);
            return {
                success: true,
                messageId: result.messageId
            };
        } catch (error) {
            console.error('❌ Failed to send contact form email:', error.message);
            // Don't throw error in development - just log it
            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Email sending failed: ${error.message}`);
            }
            return {
                success: false,
                error: error.message
            };
        }
    }

    generateBookingEmailTemplate(booking) {
        const scheduleInfo = booking.is_scheduled
            ? `<p><strong>Scheduled Time:</strong> ${new Date(booking.schedule_time).toLocaleString()}</p>`
            : '<p><strong>Ride Type:</strong> Immediate</p>';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>New Ride Booking</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FFD700; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 20px; }
                    .booking-details { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #000; margin: 0;">🚖 New Ride Booking</h1>
                    </div>
                    <div class="content">
                        <h2>Booking Details</h2>
                        <div class="booking-details">
                            <p><strong>Booking ID:</strong> #${booking.id || 'Pending'}</p>
                            <p><strong>Pickup Location:</strong> ${booking.pickup_location}</p>
                            <p><strong>Destination:</strong> ${booking.destination}</p>
                            <p><strong>Phone Number:</strong> ${booking.country_code} ${booking.phone_number}</p>
                            <p><strong>Passengers:</strong> ${booking.passengers}</p>
                            <p><strong>Bags:</strong> ${booking.bags}</p>
                            ${scheduleInfo}
                            <p><strong>Status:</strong> ${booking.status || 'Booked'}</p>
                            <p><strong>Booking Time:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <p>Please contact the customer to confirm the booking and provide further details.</p>
                    </div>
                    <div class="footer">
                        <p>Ryde Taxi Service - Admin Notification</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateBookingTextTemplate(booking) {
        const scheduleInfo = booking.is_scheduled
            ? `Scheduled Time: ${new Date(booking.schedule_time).toLocaleString()}`
            : 'Ride Type: Immediate';

        return `
NEW RIDE BOOKING - RYDE TAXI SERVICE

Booking Details:
- Booking ID: #${booking.id || 'Pending'}
- Pickup Location: ${booking.pickup_location}
- Destination: ${booking.destination}
- Phone Number: ${booking.country_code} ${booking.phone_number}
- Passengers: ${booking.passengers}
- Bags: ${booking.bags}
- ${scheduleInfo}
- Status: ${booking.status || 'Booked'}
- Booking Time: ${new Date().toLocaleString()}

Please contact the customer to confirm the booking and provide further details.

Ryde Taxi Service - Admin Notification
        `;
    }

    generateContactEmailTemplate(contact) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Contact Form Submission</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FFD700; padding: 20px; text-align: center; }
                    .content { background-color: #f9f9f9; padding: 20px; }
                    .contact-details { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #000; margin: 0;">📧 Contact Form Submission</h1>
                    </div>
                    <div class="content">
                        <h2>Contact Details</h2>
                        <div class="contact-details">
                            <p><strong>Name:</strong> ${contact.name}</p>
                            <p><strong>Email:</strong> ${contact.email}</p>
                            <p><strong>Phone:</strong> ${contact.phone || 'Not provided'}</p>
                            <p><strong>Subject:</strong> ${contact.subject}</p>
                            <p><strong>Message:</strong></p>
                            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px;">${contact.message}</p>
                            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Ryde Taxi Service - Contact Form</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    generateContactTextTemplate(contact) {
        return `
CONTACT FORM SUBMISSION - RYDE TAXI SERVICE

Contact Details:
- Name: ${contact.name}
- Email: ${contact.email}
- Phone: ${contact.phone || 'Not provided'}
- Subject: ${contact.subject}
- Message: ${contact.message}
- Submitted: ${new Date().toLocaleString()}

Ryde Taxi Service - Contact Form
        `;
    }

    async testConnection() {
        try {
            if (!this.transporter) {
                return { success: false, message: 'Email transporter not initialized' };
            }
            await this.transporter.verify();
            return { success: true, message: 'SMTP connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new EmailService();