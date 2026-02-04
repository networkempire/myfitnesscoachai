const pool = require('../config/database');

const BetaRequest = {
  async create(name, email) {
    const result = await pool.query(
      `INSERT INTO beta_requests (name, email)
       VALUES ($1, $2)
       RETURNING id, name, email, status, created_at`,
      [name, email.toLowerCase()]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM beta_requests WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM beta_requests WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findAll(status = null) {
    let query = 'SELECT * FROM beta_requests';
    const params = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE beta_requests
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }
};

module.exports = BetaRequest;
