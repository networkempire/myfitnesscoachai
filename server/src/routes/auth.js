const express = require('express');
const router = express.Router();
const { signup, login, verify, forgotPassword, resetPassword, validateResetToken } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', authMiddleware, verify);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/validate-reset-token', validateResetToken);

module.exports = router;
