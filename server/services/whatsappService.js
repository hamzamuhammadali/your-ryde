const axios = require('axios');
const config = require('../config/config');

class WhatsAppService {
    constructor() {
        this.apiUrl = config.whatsapp.apiUrl;
        this.phoneNumber = config.whatsapp.phoneNumber;
        this.apiToken = config.whatsapp.apiToken;
        this.adminPhone = config.admin.phone;
    }

    async sendBookingNotification(bookingData) {
        try {
            const message = this.generateBookingMessage(bookingData);
            
            // For demo purposes, we'll use a simple WhatsApp Web URL approach
            // In production, you would use WhatsApp Business API
            const result = await this.sendMessage(this.adminPhone, message);
            
            console.log('WhatsApp booking notification sent successfully');
            return {
                success: true,
                message: 'WhatsApp notification sent',
                data: result
            };
        } catch (error) {
            console.error('Failed to send WhatsApp booking notification:', error);
            throw new Error(`WhatsApp notification failed: ${error.message}`);
        }
    }

    async sendMessage(phoneNumber, message) {
        try {
            // This is a simplified implementation
            // In production, you would integrate with WhatsApp Business API
            if (!this.apiToken || !this.apiUrl) {
                console.warn('WhatsApp API not configured, logging message instead');
                console.log('WhatsApp Message:', { to: phoneNumber, message });
                return {
                    success: true,
                    method: 'logged',
                    to: phoneNumber,
                    message: message
                };
            }

            // Example API call structure (adjust based on your WhatsApp API provider)
            const response = await axios.post(this.apiUrl, {
                phone: phoneNumber,
                message: message,
                token: this.apiToken
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiToken}`
                },
                timeout: 10000 // 10 second timeout
            });

            return {
                success: true,
                method: 'api',
                response: response.data
            };
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('WhatsApp API request timeout');
            }
            throw new Error(`WhatsApp API error: ${error.message}`);
        }
    }

    generateBookingMessage(booking) {
        const scheduleInfo = booking.is_scheduled 
            ? `🕒 *Scheduled:* ${new Date(booking.schedule_time).toLocaleString()}`
            : '🕒 *Type:* Immediate';

        return `🚖 *NEW RIDE BOOKING*

📍 *Pickup:* ${booking.pickup_location}
🎯 *Destination:* ${booking.destination}
📱 *Phone:* ${booking.country_code} ${booking.phone_number}
👥 *Passengers:* ${booking.passengers}
🧳 *Bags:* ${booking.bags}
${scheduleInfo}
📊 *Status:* ${booking.status || 'Booked'}
⏰ *Booked:* ${new Date().toLocaleString()}

Please contact the customer to confirm the booking.

_Ryde Taxi Service_`;
    }

    generateWhatsAppUrl(phoneNumber, message) {
        // Generate WhatsApp Web URL for manual sending
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    async testConnection() {
        try {
            if (!this.apiToken || !this.apiUrl) {
                return {
                    success: false,
                    message: 'WhatsApp API not configured (this is normal for development)',
                    configured: false
                };
            }

            // Test API connection
            const response = await axios.get(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                },
                timeout: 5000
            });

            return {
                success: true,
                message: 'WhatsApp API connection successful',
                configured: true
            };
        } catch (error) {
            return {
                success: false,
                message: `WhatsApp API connection failed: ${error.message}`,
                configured: true
            };
        }
    }

    // Utility method to validate phone number format
    validatePhoneNumber(phoneNumber) {
        const phoneRegex = /^\+?[1-9]\d{4,14}$/; // At least 5 digits, max 15, can't start with 0
        return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
    }

    // Method to format phone number for WhatsApp
    formatPhoneNumber(countryCode, phoneNumber) {
        const cleanCountryCode = countryCode.replace(/[^\d]/g, '');
        const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
        return `+${cleanCountryCode}${cleanPhone}`;
    }
}

module.exports = new WhatsAppService();