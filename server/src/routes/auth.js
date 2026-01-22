const express = require('express');
const router = express.Router();
const { signup, login, verify } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify', authMiddleware, verify);

module.exports = router;
