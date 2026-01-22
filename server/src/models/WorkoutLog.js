const pool = require('../config/database');

class WorkoutLog {
  static async create(userId, programId, data) {
    const result = await pool.query(
      `INSERT INTO workout_logs (user_id, program_id, workout_date, day_name, session_name, exercises_logged, completed, duration_minutes, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        userId,
        programId,
        data.workout_date,
        data.day_name,
        data.session_name,
        JSON.stringify(data.exercises_logged),
        data.completed || false,
        data.duration_minutes,
        data.notes
      ]
    );
    return result.rows[0];
  }

  static async findByUserAndDate(userId, date) {
    const result = await pool.query(
      `SELECT * FROM workout_logs
       WHERE user_id = $1 AND workout_date = $2
       ORDER BY created_at DESC`,
      [userId, date]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM workout_logs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findRecentByUser(userId, limit = 10) {
    const result = await pool.query(
      `SELECT * FROM workout_logs
       WHERE user_id = $1
       ORDER BY workout_date DESC, created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  static async markCompleted(id, userId) {
    const result = await pool.query(
      `UPDATE workout_logs
       SET completed = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  static async updateExercises(id, userId, exercisesLogged) {
    const result = await pool.query(
      `UPDATE workout_logs
       SET exercises_logged = $3
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, JSON.stringify(exercisesLogged)]
    );
    return result.rows[0];
  }

  static async getTodaysLog(userId, programId, dayName) {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT * FROM workout_logs
       WHERE user_id = $1 AND program_id = $2 AND workout_date = $3 AND day_name = $4
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, programId, today, dayName]
    );
    return result.rows[0] || null;
  }

  static async getCompletedCount(userId) {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM workout_logs
       WHERE user_id = $1 AND completed = true`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  static async getLastWeightsForDay(userId, dayName) {
    // Get the most recent completed workout for this day to retrieve weights used
    const result = await pool.query(
      `SELECT exercises_logged FROM workout_logs
       WHERE user_id = $1 AND day_name = $2 AND completed = true
       ORDER BY workout_date DESC, created_at DESC
       LIMIT 1`,
      [userId, dayName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Return a map of exercise name -> weight used
    const exercises = result.rows[0].exercises_logged;
    const weightMap = {};
    exercises.forEach(ex => {
      if (ex.weight_used) {
        weightMap[ex.name] = ex.weight_used;
      }
    });
    return weightMap;
  }

  static async getWeightProgression(userId, exerciseName = null) {
    // Get all completed workouts with exercise data
    const result = await pool.query(
      `SELECT workout_date, exercises_logged FROM workout_logs
       WHERE user_id = $1 AND completed = true
       ORDER BY workout_date ASC`,
      [userId]
    );

    // Build progression data for each exercise
    const progressionMap = {};

    result.rows.forEach(row => {
      const date = row.workout_date;
      const exercises = row.exercises_logged;

      exercises.forEach(ex => {
        if (!ex.weight_used || ex.weight_used === 'bodyweight') return;

        // Try to extract numeric weight
        const weightMatch = ex.weight_used.match(/(\d+\.?\d*)/);
        if (!weightMatch) return;

        const weight = parseFloat(weightMatch[1]);
        const name = ex.name;

        if (!progressionMap[name]) {
          progressionMap[name] = [];
        }

        progressionMap[name].push({
          date: date,
          weight: weight,
          raw: ex.weight_used
        });
      });
    });

    // If specific exercise requested, return just that
    if (exerciseName) {
      return progressionMap[exerciseName] || [];
    }

    return progressionMap;
  }

  static async getExerciseList(userId) {
    // Get list of all exercises the user has logged
    const result = await pool.query(
      `SELECT DISTINCT exercises_logged FROM workout_logs
       WHERE user_id = $1 AND completed = true`,
      [userId]
    );

    const exerciseSet = new Set();
    result.rows.forEach(row => {
      row.exercises_logged.forEach(ex => {
        if (ex.name) {
          exerciseSet.add(ex.name);
        }
      });
    });

    return Array.from(exerciseSet).sort();
  }
}

module.exports = WorkoutLog;
