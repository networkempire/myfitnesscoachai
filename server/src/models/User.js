const pool = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const User = {
  async create(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, is_premium, created_at`,
      [email, passwordHash]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, is_premium, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async verifyPassword(password, passwordHash) {
    return bcrypt.compare(password, passwordHash);
  },

  async updatePassword(userId, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email`,
      [passwordHash, userId]
    );
    return result.rows[0];
  },

  async createResetToken(userId) {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Invalidate any existing tokens for this user
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [userId]
    );

    // Create new token
    const result = await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, token, expires_at`,
      [userId, token, expiresAt]
    );
    return result.rows[0];
  },

  async findByResetToken(token) {
    const result = await pool.query(
      `SELECT prt.*, u.email, u.id as user_id
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token]
    );
    return result.rows[0];
  },

  async markTokenUsed(token) {
    await pool.query(
      'UPDATE password_reset_tokens SET used = TRUE WHERE token = $1',
      [token]
    );
  }
};

module.exports = User;
