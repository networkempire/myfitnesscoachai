const pool = require('../config/database');

const Program = {
  async create(userId, conversationId, programName, workoutProgram, nutritionPlan, flexibilityProgram) {
    // Deactivate any existing active programs for this user
    await pool.query(
      'UPDATE programs SET is_active = FALSE WHERE user_id = $1 AND is_active = TRUE',
      [userId]
    );

    const result = await pool.query(
      `INSERT INTO programs (user_id, conversation_id, program_name, workout_program, nutrition_plan, flexibility_program)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        userId,
        conversationId,
        programName,
        JSON.stringify(workoutProgram),
        JSON.stringify(nutritionPlan),
        JSON.stringify(flexibilityProgram)
      ]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM programs WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findActiveByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM programs WHERE user_id = $1 AND is_active = TRUE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  async findAllByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM programs WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async setActive(id, userId) {
    // Deactivate all programs for this user
    await pool.query(
      'UPDATE programs SET is_active = FALSE WHERE user_id = $1',
      [userId]
    );

    // Activate the specified program
    const result = await pool.query(
      'UPDATE programs SET is_active = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }
};

module.exports = Program;
