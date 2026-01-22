const express = require('express');
const router = express.Router();
const { startIntake, sendMessage, getConversation } = require('../controllers/intakeController');
const authMiddleware = require('../middleware/auth');

// All intake routes require authentication
router.use(authMiddleware);

router.post('/start', startIntake);
router.post('/message', sendMessage);
router.get('/:conversation_id', getConversation);

module.exports = router;
