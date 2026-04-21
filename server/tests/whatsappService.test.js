const whatsappService = require('../services/whatsappService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('WhatsAppService', () => {
    beforeEach(() => {
        // Reset console methods
        console.log = jest.fn();
        console.error = jest.fn();
        console.warn = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendBookingNotification', () => {
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

        it('should send WhatsApp notification successfully when API is configured', async () => {
            // Mock configured service
            whatsappService.apiToken = 'test-token';
            whatsappService.apiUrl = 'https://api.whatsapp.com/send';
            
            const mockResponse = { data: { success: true, messageId: 'wa-123' } };
            axios.post.mockResolvedValue(mockResponse);

            const result = await whatsappService.sendBookingNotification(mockBookingData);

            expect(result).toEqual({
                success: true,
                message: 'WhatsApp notification sent',
                data: expect.objectContaining({
                    success: true,
                    method: 'api'
                })
            });
        });

        it('should log message when API is not configured', async () => {
            // Mock unconfigured service
            whatsappService.apiToken = '';
            whatsappService.apiUrl = '';

            const result = await whatsappService.sendBookingNotification(mockBookingData);

            expect(result).toEqual({
                success: true,
                message: 'WhatsApp notification sent',
                data: expect.objectContaining({
                    success: true,
                    method: 'logged'
                })
            });
            expect(console.warn).toHaveBeenCalledWith(
                'WhatsApp API not configured, logging message instead'
            );
        });

        it('should handle API timeout errors', async () => {
            whatsappService.apiToken = 'test-token';
            whatsappService.apiUrl = 'https://api.whatsapp.com/send';
            
            const timeoutError = new Error('Request timeout');
            timeoutError.code = 'ECONNABORTED';
            axios.post.mockRejectedValue(timeoutError);

            await expect(whatsappService.sendBookingNotification(mockBookingData))
                .rejects.toThrow('WhatsApp notification failed: WhatsApp API request timeout');
        });

        it('should handle general API errors', async () => {
            whatsappService.apiToken = 'test-token';
            whatsappService.apiUrl = 'https://api.whatsapp.com/send';
            
            const apiError = new Error('API Error');
            axios.post.mockRejectedValue(apiError);

            await expect(whatsappService.sendBookingNotification(mockBookingData))
                .rejects.toThrow('WhatsApp notification failed: WhatsApp API error: API Error');
        });
    });

    describe('generateBookingMessage', () => {
        it('should generate message for immediate booking', () => {
            const booking = {
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

            const message = whatsappService.generateBookingMessage(booking);

            expect(message).toContain('🚖 *NEW RIDE BOOKING*');
            expect(message).toContain('123 Main St');
            expect(message).toContain('456 Oak Ave');
            expect(message).toContain('+1 1234567890');
            expect(message).toContain('*Type:* Immediate');
            expect(message).toContain('*Passengers:* 2');
            expect(message).toContain('*Bags:* 1');
        });

        it('should generate message for scheduled booking', () => {
            const booking = {
                id: 1,
                pickup_location: '123 Main St',
                destination: '456 Oak Ave',
                country_code: '+1',
                phone_number: '1234567890',
                passengers: 2,
                bags: 1,
                is_scheduled: true,
                schedule_time: '2024-12-25T10:00:00Z',
                status: 'booked'
            };

            const message = whatsappService.generateBookingMessage(booking);

            expect(message).toContain('*Scheduled:*');
            expect(message).not.toContain('*Type:* Immediate');
        });
    });

    describe('generateWhatsAppUrl', () => {
        it('should generate correct WhatsApp Web URL', () => {
            const phoneNumber = '+1234567890';
            const message = 'Test message';

            const url = whatsappService.generateWhatsAppUrl(phoneNumber, message);

            expect(url).toBe('https://wa.me/1234567890?text=Test%20message');
        });

        it('should handle phone numbers with spaces and special characters', () => {
            const phoneNumber = '+1 (234) 567-890';
            const message = 'Test message';

            const url = whatsappService.generateWhatsAppUrl(phoneNumber, message);

            expect(url).toBe('https://wa.me/1234567890?text=Test%20message');
        });
    });

    describe('validatePhoneNumber', () => {
        it('should validate correct phone numbers', () => {
            expect(whatsappService.validatePhoneNumber('+1234567890')).toBe(true);
            expect(whatsappService.validatePhoneNumber('1234567890')).toBe(true);
            expect(whatsappService.validatePhoneNumber('+44 20 7946 0958')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(whatsappService.validatePhoneNumber('')).toBe(false);
            expect(whatsappService.validatePhoneNumber('abc')).toBe(false);
            expect(whatsappService.validatePhoneNumber('+0123456789')).toBe(false); // starts with 0
            expect(whatsappService.validatePhoneNumber('123')).toBe(false); // too short
        });
    });

    describe('formatPhoneNumber', () => {
        it('should format phone number correctly', () => {
            const result = whatsappService.formatPhoneNumber('+1', '234-567-890');
            expect(result).toBe('+1234567890');
        });

        it('should handle country codes without plus sign', () => {
            const result = whatsappService.formatPhoneNumber('44', '20 7946 0958');
            expect(result).toBe('+442079460958');
        });
    });

    describe('testConnection', () => {
        it('should return not configured when API settings are missing', async () => {
            whatsappService.apiToken = '';
            whatsappService.apiUrl = '';

            const result = await whatsappService.testConnection();

            expect(result).toEqual({
                success: false,
                message: 'WhatsApp API not configured (this is normal for development)',
                configured: false
            });
        });

        it('should return success when API connection works', async () => {
            whatsappService.apiToken = 'test-token';
            whatsappService.apiUrl = 'https://api.whatsapp.com';
            
            axios.get.mockResolvedValue({ data: { success: true } });

            const result = await whatsappService.testConnection();

            expect(result).toEqual({
                success: true,
                message: 'WhatsApp API connection successful',
                configured: true
            });
        });

        it('should return failure when API connection fails', async () => {
            whatsappService.apiToken = 'test-token';
            whatsappService.apiUrl = 'https://api.whatsapp.com';
            
            const error = new Error('Connection failed');
            axios.get.mockRejectedValue(error);

            const result = await whatsappService.testConnection();

            expect(result).toEqual({
                success: false,
                message: 'WhatsApp API connection failed: Connection failed',
                configured: true
            });
        });
    });
});