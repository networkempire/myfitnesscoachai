const express = require('express');
const router = express.Router();
const {
  getCurrentProfile,
  startUpdate,
  sendMessage,
  confirmUpdate
} = require('../controllers/profileUpdateController');
const authMiddleware = require('../middleware/auth');

// All profile update routes require authentication
router.use(authMiddleware);

// Get current profile data
router.get('/current', getCurrentProfile);

// Start a profile update conversation
router.post('/start', startUpdate);

// Send message in update conversation
router.post('/message', sendMessage);

// Confirm and save changes
router.post('/confirm', confirmUpdate);

module.exports = router;
