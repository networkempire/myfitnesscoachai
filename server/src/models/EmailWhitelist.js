const pool = require('../config/database');

const EmailWhitelist = {
  async add(email, addedBy = null, notes = null) {
    const result = await pool.query(
      `INSERT INTO email_whitelist (email, added_by, notes)
       VALUES ($1, $2, $3)
       RETURNING id, email, added_by, notes, created_at`,
      [email.toLowerCase(), addedBy, notes]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      'DELETE FROM email_whitelist WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  async isWhitelisted(email) {
    const result = await pool.query(
      'SELECT id FROM email_whitelist WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows.length > 0;
  },

  async findAll() {
    const result = await pool.query(
      `SELECT w.*, u.email as added_by_email
       FROM email_whitelist w
       LEFT JOIN users u ON w.added_by = u.id
       ORDER BY w.created_at DESC`
    );
    return result.rows;
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM email_whitelist WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0];
  }
};

module.exports = EmailWhitelist;
