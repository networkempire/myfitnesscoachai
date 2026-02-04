const User = require('../models/User');
const EmailWhitelist = require('../models/EmailWhitelist');
const { generateToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../services/emailService');

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email is whitelisted
    const isWhitelisted = await EmailWhitelist.isWhitelisted(email);
    if (!isWhitelisted) {
      return res.status(403).json({
        error: 'This email is not on our beta list. Please request access first.',
        notWhitelisted: true
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create(email, password);
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        is_premium: user.is_premium,
        is_admin: user.is_admin || false
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        is_premium: user.is_premium,
        is_admin: user.is_admin || false
      }
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      is_premium: req.user.is_premium,
      is_admin: req.user.is_admin || false
    }
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, we sent a password reset link.'
      });
    }

    // Create reset token
    const resetToken = await User.createResetToken(user.id);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken.token);

    res.json({
      message: 'If an account with that email exists, we sent a password reset link.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find valid token
    const resetRecord = await User.findByResetToken(token);

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Update password
    await User.updatePassword(resetRecord.user_id, password);

    // Mark token as used
    await User.markTokenUsed(token);

    res.json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

const validateResetToken = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    const resetRecord = await User.findByResetToken(token);

    if (!resetRecord) {
      return res.json({ valid: false, error: 'Invalid or expired reset link' });
    }

    res.json({ valid: true, email: resetRecord.email });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, verify, forgotPassword, resetPassword, validateResetToken };
