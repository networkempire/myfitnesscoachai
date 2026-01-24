const pool = require('../config/database');

const ProfileUpdate = {
  async create(userId, conversationId, messages, changesMade, updateType, programsRegenerated = false) {
    const result = await pool.query(
      `INSERT INTO profile_updates (user_id, conversation_id, messages, changes_made, update_type, programs_regenerated)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, conversationId, JSON.stringify(messages), JSON.stringify(changesMade), updateType, programsRegenerated]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM profile_updates WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM profile_updates WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async getRecentByUserId(userId, limit = 10) {
    const result = await pool.query(
      'SELECT * FROM profile_updates WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  },

  async updateProgramsRegenerated(id, regenerated = true) {
    const result = await pool.query(
      `UPDATE profile_updates
       SET programs_regenerated = $1
       WHERE id = $2
       RETURNING *`,
      [regenerated, id]
    );
    return result.rows[0];
  }
};

module.exports = ProfileUpdate;
