const emailService = require('./emailService');
const whatsappService = require('./whatsappService');

class NotificationService {
    constructor() {
        this.emailService = emailService;
        this.whatsappService = whatsappService;
    }

    async sendBookingNotifications(bookingData) {
        const results = {
            email: { success: false, error: null },
            whatsapp: { success: false, error: null }
        };

        // Send email notification
        try {
            const emailResult = await this.emailService.sendBookingConfirmation(bookingData);
            results.email = { success: true, data: emailResult };
        } catch (error) {
            results.email = { success: false, error: error.message };
            console.error('Email notification failed:', error.message);
        }

        // Send WhatsApp notification
        try {
            const whatsappResult = await this.whatsappService.sendBookingNotification(bookingData);
            results.whatsapp = { success: true, data: whatsappResult };
        } catch (error) {
            results.whatsapp = { success: false, error: error.message };
            console.error('WhatsApp notification failed:', error.message);
        }

        // Determine overall success
        const overallSuccess = results.email.success || results.whatsapp.success;
        
        return {
            success: overallSuccess,
            results: results,
            message: this.generateResultMessage(results)
        };
    }

    async sendContactFormNotification(contactData) {
        try {
            const emailResult = await this.emailService.sendContactFormEmail(contactData);
            return {
                success: true,
                data: emailResult,
                message: 'Contact form notification sent successfully'
            };
        } catch (error) {
            console.error('Contact form notification failed:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send contact form notification'
            };
        }
    }

    generateResultMessage(results) {
        const messages = [];
        
        if (results.email.success) {
            messages.push('Email notification sent');
        } else {
            messages.push(`Email failed: ${results.email.error}`);
        }

        if (results.whatsapp.success) {
            messages.push('WhatsApp notification sent');
        } else {
            messages.push(`WhatsApp failed: ${results.whatsapp.error}`);
        }

        return messages.join('; ');
    }

    async testServices() {
        const results = {
            email: await this.emailService.testConnection(),
            whatsapp: await this.whatsappService.testConnection()
        };

        return {
            email: results.email,
            whatsapp: results.whatsapp,
            overall: results.email.success || results.whatsapp.success
        };
    }

    // Retry mechanism for failed notifications
    async retryNotification(type, data, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Retry attempt ${attempt} for ${type} notification`);
                
                if (type === 'email') {
                    return await this.emailService.sendBookingConfirmation(data);
                } else if (type === 'whatsapp') {
                    return await this.whatsappService.sendBookingNotification(data);
                }
                
                throw new Error(`Unknown notification type: ${type}`);
            } catch (error) {
                lastError = error;
                console.error(`${type} notification attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    const delay = Math.pow(2, attempt) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }

    // Queue system for handling notification failures (basic implementation)
    async queueFailedNotification(type, data) {
        // In a production system, you would use a proper queue system like Redis or RabbitMQ
        console.log(`Queueing failed ${type} notification for retry:`, {
            type,
            bookingId: data.id,
            timestamp: new Date().toISOString()
        });
        
        // For now, just log the failed notification
        // In production, implement proper queue storage and processing
        return {
            queued: true,
            type,
            data: data.id || 'unknown',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new NotificationService();