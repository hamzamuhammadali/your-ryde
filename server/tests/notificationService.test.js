const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// Mock the services
jest.mock('../services/emailService');
jest.mock('../services/whatsappService');

describe('NotificationService', () => {
    beforeEach(() => {
        // Reset console methods
        console.log = jest.fn();
        console.error = jest.fn();
        
        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('sendBookingNotifications', () => {
        const mockBookingData = {
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

        it('should send both email and WhatsApp notifications successfully', async () => {
            const emailResult = { success: true, messageId: 'email-123' };
            const whatsappResult = { success: true, message: 'WhatsApp sent' };

            emailService.sendBookingConfirmation.mockResolvedValue(emailResult);
            whatsappService.sendBookingNotification.mockResolvedValue(whatsappResult);

            const result = await notificationService.sendBookingNotifications(mockBookingData);

            expect(result).toEqual({
                success: true,
                results: {
                    email: { success: true, data: emailResult },
                    whatsapp: { success: true, data: whatsappResult }
                },
                message: 'Email notification sent; WhatsApp notification sent'
            });
        });

        it('should handle email failure but WhatsApp success', async () => {
            const emailError = new Error('SMTP failed');
            const whatsappResult = { success: true, message: 'WhatsApp sent' };

            emailService.sendBookingConfirmation.mockRejectedValue(emailError);
            whatsappService.sendBookingNotification.mockResolvedValue(whatsappResult);

            const result = await notificationService.sendBookingNotifications(mockBookingData);

            expect(result).toEqual({
                success: true, // Overall success because WhatsApp worked
                results: {
                    email: { success: false, error: 'SMTP failed' },
                    whatsapp: { success: true, data: whatsappResult }
                },
                message: 'Email failed: SMTP failed; WhatsApp notification sent'
            });
            expect(console.error).toHaveBeenCalledWith('Email notification failed:', 'SMTP failed');
        });

        it('should handle WhatsApp failure but email success', async () => {
            const emailResult = { success: true, messageId: 'email-123' };
            const whatsappError = new Error('WhatsApp API failed');

            emailService.sendBookingConfirmation.mockResolvedValue(emailResult);
            whatsappService.sendBookingNotification.mockRejectedValue(whatsappError);

            const result = await notificationService.sendBookingNotifications(mockBookingData);

            expect(result).toEqual({
                success: true, // Overall success because email worked
                results: {
                    email: { success: true, data: emailResult },
                    whatsapp: { success: false, error: 'WhatsApp API failed' }
                },
                message: 'Email notification sent; WhatsApp failed: WhatsApp API failed'
            });
            expect(console.error).toHaveBeenCalledWith('WhatsApp notification failed:', 'WhatsApp API failed');
        });

        it('should handle both email and WhatsApp failures', async () => {
            const emailError = new Error('SMTP failed');
            const whatsappError = new Error('WhatsApp API failed');

            emailService.sendBookingConfirmation.mockRejectedValue(emailError);
            whatsappService.sendBookingNotification.mockRejectedValue(whatsappError);

            const result = await notificationService.sendBookingNotifications(mockBookingData);

            expect(result).toEqual({
                success: false, // Overall failure
                results: {
                    email: { success: false, error: 'SMTP failed' },
                    whatsapp: { success: false, error: 'WhatsApp API failed' }
                },
                message: 'Email failed: SMTP failed; WhatsApp failed: WhatsApp API failed'
            });
        });
    });

    describe('sendContactFormNotification', () => {
        const mockContactData = {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Test Subject',
            message: 'Test message'
        };

        it('should send contact form notification successfully', async () => {
            const emailResult = { success: true, messageId: 'contact-123' };
            emailService.sendContactFormEmail.mockResolvedValue(emailResult);

            const result = await notificationService.sendContactFormNotification(mockContactData);

            expect(result).toEqual({
                success: true,
                data: emailResult,
                message: 'Contact form notification sent successfully'
            });
        });

        it('should handle contact form notification failure', async () => {
            const error = new Error('Email failed');
            emailService.sendContactFormEmail.mockRejectedValue(error);

            const result = await notificationService.sendContactFormNotification(mockContactData);

            expect(result).toEqual({
                success: false,
                error: 'Email failed',
                message: 'Failed to send contact form notification'
            });
            expect(console.error).toHaveBeenCalledWith('Contact form notification failed:', 'Email failed');
        });
    });

    describe('testServices', () => {
        it('should test both email and WhatsApp services', async () => {
            const emailTest = { success: true, message: 'Email OK' };
            const whatsappTest = { success: false, message: 'WhatsApp not configured' };

            emailService.testConnection.mockResolvedValue(emailTest);
            whatsappService.testConnection.mockResolvedValue(whatsappTest);

            const result = await notificationService.testServices();

            expect(result).toEqual({
                email: emailTest,
                whatsapp: whatsappTest,
                overall: true // At least one service is working
            });
        });

        it('should return false overall when both services fail', async () => {
            const emailTest = { success: false, message: 'Email failed' };
            const whatsappTest = { success: false, message: 'WhatsApp failed' };

            emailService.testConnection.mockResolvedValue(emailTest);
            whatsappService.testConnection.mockResolvedValue(whatsappTest);

            const result = await notificationService.testServices();

            expect(result).toEqual({
                email: emailTest,
                whatsapp: whatsappTest,
                overall: false
            });
        });
    });

    describe('retryNotification', () => {
        const mockData = { id: 1, pickup_location: 'Test Location' };

        it('should retry email notification successfully', async () => {
            const emailResult = { success: true, messageId: 'retry-123' };
            emailService.sendBookingConfirmation.mockResolvedValue(emailResult);

            const result = await notificationService.retryNotification('email', mockData, 2);

            expect(result).toEqual(emailResult);
            expect(emailService.sendBookingConfirmation).toHaveBeenCalledTimes(1);
        });

        it('should retry WhatsApp notification successfully', async () => {
            const whatsappResult = { success: true, message: 'Retry successful' };
            whatsappService.sendBookingNotification.mockResolvedValue(whatsappResult);

            const result = await notificationService.retryNotification('whatsapp', mockData, 2);

            expect(result).toEqual(whatsappResult);
            expect(whatsappService.sendBookingNotification).toHaveBeenCalledTimes(1);
        });

        it('should retry multiple times before giving up', async () => {
            const error = new Error('Service unavailable');
            emailService.sendBookingConfirmation.mockRejectedValue(error);

            await expect(notificationService.retryNotification('email', mockData, 3))
                .rejects.toThrow('Service unavailable');

            expect(emailService.sendBookingConfirmation).toHaveBeenCalledTimes(3);
        });

        it('should throw error for unknown notification type', async () => {
            await expect(notificationService.retryNotification('sms', mockData, 1))
                .rejects.toThrow('Unknown notification type: sms');
        });
    });

    describe('queueFailedNotification', () => {
        it('should queue failed notification', async () => {
            const mockData = { id: 123, pickup_location: 'Test Location' };

            const result = await notificationService.queueFailedNotification('email', mockData);

            expect(result).toEqual({
                queued: true,
                type: 'email',
                data: 123,
                timestamp: expect.any(String)
            });
            expect(console.log).toHaveBeenCalledWith(
                'Queueing failed email notification for retry:',
                expect.objectContaining({
                    type: 'email',
                    bookingId: 123
                })
            );
        });

        it('should handle data without id', async () => {
            const mockData = { pickup_location: 'Test Location' };

            const result = await notificationService.queueFailedNotification('whatsapp', mockData);

            expect(result.data).toBe('unknown');
        });
    });

    describe('generateResultMessage', () => {
        it('should generate message for successful notifications', () => {
            const results = {
                email: { success: true },
                whatsapp: { success: true }
            };

            const message = notificationService.generateResultMessage(results);

            expect(message).toBe('Email notification sent; WhatsApp notification sent');
        });

        it('should generate message for mixed results', () => {
            const results = {
                email: { success: false, error: 'SMTP failed' },
                whatsapp: { success: true }
            };

            const message = notificationService.generateResultMessage(results);

            expect(message).toBe('Email failed: SMTP failed; WhatsApp notification sent');
        });

        it('should generate message for all failures', () => {
            const results = {
                email: { success: false, error: 'SMTP failed' },
                whatsapp: { success: false, error: 'API failed' }
            };

            const message = notificationService.generateResultMessage(results);

            expect(message).toBe('Email failed: SMTP failed; WhatsApp failed: API failed');
        });
    });
});