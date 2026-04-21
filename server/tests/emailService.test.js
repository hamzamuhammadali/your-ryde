const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
    let emailService;
    let mockTransporter;

    beforeEach(() => {
        // Create mock transporter
        mockTransporter = {
            verify: jest.fn(),
            sendMail: jest.fn()
        };
        
        nodemailer.createTransporter = jest.fn().mockReturnValue(mockTransporter);
        
        // Set test environment
        process.env.NODE_ENV = 'test';
        
        // Reset console methods
        console.log = jest.fn();
        console.error = jest.fn();
        
        // Clear module cache and require fresh instance
        jest.resetModules();
        emailService = require('../services/emailService');
        
        // Manually set the transporter for testing
        emailService.transporter = mockTransporter;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('sendBookingConfirmation', () => {
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

        it('should send booking confirmation email successfully', async () => {
            const mockResult = { messageId: 'test-message-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            const result = await emailService.sendBookingConfirmation(mockBookingData);

            expect(result).toEqual({
                success: true,
                messageId: 'test-message-id'
            });
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'New Ride Booking - Ryde Taxi Service',
                    html: expect.stringContaining('123 Main St'),
                    text: expect.stringContaining('123 Main St')
                })
            );
        });

        it('should handle scheduled ride booking', async () => {
            const scheduledBooking = {
                ...mockBookingData,
                is_scheduled: true,
                schedule_time: '2024-12-25T10:00:00Z'
            };
            
            const mockResult = { messageId: 'test-message-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            await emailService.sendBookingConfirmation(scheduledBooking);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Scheduled Time'),
                    text: expect.stringContaining('Scheduled Time')
                })
            );
        });

        it('should handle error when email sending fails', async () => {
            const error = new Error('SMTP connection failed');
            mockTransporter.sendMail.mockRejectedValue(error);

            const result = await emailService.sendBookingConfirmation(mockBookingData);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('SMTP connection failed');
        });
    });

    describe('sendContactFormEmail', () => {
        const mockContactData = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            subject: 'Test Subject',
            message: 'Test message content'
        };

        it('should send contact form email successfully', async () => {
            const mockResult = { messageId: 'contact-message-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            const result = await emailService.sendContactFormEmail(mockContactData);

            expect(result).toEqual({
                success: true,
                messageId: 'contact-message-id'
            });
            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'New Contact Form Submission - Ryde Taxi Service',
                    html: expect.stringContaining('John Doe'),
                    text: expect.stringContaining('John Doe')
                })
            );
        });

        it('should handle contact form without phone number', async () => {
            const contactWithoutPhone = {
                ...mockContactData,
                phone: undefined
            };
            
            const mockResult = { messageId: 'contact-message-id' };
            mockTransporter.sendMail.mockResolvedValue(mockResult);

            await emailService.sendContactFormEmail(contactWithoutPhone);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('Not provided'),
                    text: expect.stringContaining('Not provided')
                })
            );
        });
    });

    describe('generateBookingEmailTemplate', () => {
        it('should generate HTML template with booking details', () => {
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

            const html = emailService.generateBookingEmailTemplate(booking);

            expect(html).toContain('123 Main St');
            expect(html).toContain('456 Oak Ave');
            expect(html).toContain('+1 1234567890');
            expect(html).toContain('Immediate');
            expect(html).toContain('<!DOCTYPE html>');
        });

        it('should include scheduled time for scheduled rides', () => {
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

            const html = emailService.generateBookingEmailTemplate(booking);

            expect(html).toContain('Scheduled Time');
            expect(html).not.toContain('Immediate');
        });
    });

    describe('testConnection', () => {
        it('should return success when connection is valid', async () => {
            mockTransporter.verify.mockResolvedValue(true);

            const result = await emailService.testConnection();

            expect(result).toEqual({
                success: true,
                message: 'SMTP connection successful'
            });
        });

        it('should return failure when connection fails', async () => {
            const error = new Error('Connection failed');
            mockTransporter.verify.mockRejectedValue(error);

            const result = await emailService.testConnection();

            expect(result).toEqual({
                success: false,
                message: 'Connection failed'
            });
        });
    });
});