const express = require('express');
const router = express.Router();
const { validateContactForm } = require('../middleware/validation');
const notificationService = require('../services/notificationService');

// Submit contact form with enhanced security validation
router.post('/contact', validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Prepare contact data
    const contactData = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      submittedAt: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // In test environment, skip email sending
    if (process.env.NODE_ENV === 'test') {
      return res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!'
      });
    }

    // Send notification email to admin
    const result = await notificationService.sendContactFormNotification(contactData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully. We will get back to you soon!'
      });
    } else {
      console.error('Contact form notification failed:', result.error);
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Contact form submission error:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

module.exports = router;