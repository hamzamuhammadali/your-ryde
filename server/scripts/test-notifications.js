const notificationService = require('../services/notificationService');

async function testNotificationServices() {
    console.log('🧪 Testing Notification Services...\n');

    // Test service connections
    console.log('1. Testing service connections...');
    try {
        const connectionTests = await notificationService.testServices();
        console.log('📧 Email Service:', connectionTests.email.success ? '✅ Connected' : '❌ Failed');
        console.log('📱 WhatsApp Service:', connectionTests.whatsapp.success ? '✅ Connected' : '❌ Not configured (normal for dev)');
        console.log('🔄 Overall Status:', connectionTests.overall ? '✅ At least one service working' : '❌ All services failed');
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }

    console.log('\n2. Testing booking notification...');
    
    // Test booking notification
    const mockBookingData = {
        id: 999,
        pickup_location: '123 Test Street, Test City',
        destination: '456 Demo Avenue, Demo Town',
        country_code: '+1',
        phone_number: '5551234567',
        passengers: 2,
        bags: 1,
        is_scheduled: false,
        status: 'booked'
    };

    try {
        const result = await notificationService.sendBookingNotifications(mockBookingData);
        console.log('📧 Email Result:', result.results.email.success ? '✅ Sent' : `❌ Failed: ${result.results.email.error}`);
        console.log('📱 WhatsApp Result:', result.results.whatsapp.success ? '✅ Sent' : `❌ Failed: ${result.results.whatsapp.error}`);
        console.log('🎯 Overall Result:', result.success ? '✅ Success' : '❌ Failed');
        console.log('💬 Message:', result.message);
    } catch (error) {
        console.error('❌ Booking notification test failed:', error.message);
    }

    console.log('\n3. Testing contact form notification...');
    
    // Test contact form notification
    const mockContactData = {
        name: 'Test User',
        email: 'malihamza.uae@gmail.com',
        phone: '+1-555-123-4567',
        subject: 'Test Contact Form',
        message: 'This is a test message from the notification service test script.'
    };

    try {
        const result = await notificationService.sendContactFormNotification(mockContactData);
        console.log('📧 Contact Form Result:', result.success ? '✅ Sent' : `❌ Failed: ${result.error}`);
        console.log('💬 Message:', result.message);
    } catch (error) {
        console.error('❌ Contact form notification test failed:', error.message);
    }

    console.log('\n✨ Notification service testing completed!');
}

// Run the test if this script is executed directly
if (require.main === module) {
    testNotificationServices().catch(console.error);
}

module.exports = testNotificationServices;