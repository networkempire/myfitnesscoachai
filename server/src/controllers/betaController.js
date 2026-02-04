const BetaRequest = require('../models/BetaRequest');
const { sendBetaRequestNotification } = require('../services/emailService');

const submitBetaRequest = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check if already submitted
    const existing = await BetaRequest.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: 'This email has already been submitted for beta access',
        alreadySubmitted: true
      });
    }

    // Create the request
    const betaRequest = await BetaRequest.create(name, email);

    // Send notification email (don't fail if email fails)
    await sendBetaRequestNotification(name, email);

    res.status(201).json({
      message: 'Thank you! Your beta access request has been submitted.',
      request: {
        id: betaRequest.id,
        name: betaRequest.name,
        email: betaRequest.email,
        status: betaRequest.status
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitBetaRequest };
