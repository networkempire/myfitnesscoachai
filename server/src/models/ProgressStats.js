const pool = require('../config/database');

class ProgressStats {
  static async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM progress_stats WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  static async findOrCreate(userId) {
    let stats = await this.findByUserId(userId);

    if (!stats) {
      const result = await pool.query(
        `INSERT INTO progress_stats (user_id)
         VALUES ($1)
         RETURNING *`,
        [userId]
      );
      stats = result.rows[0];
    }

    return stats;
  }

  static async updateStats(userId, stats) {
    const result = await pool.query(
      `UPDATE progress_stats
       SET total_workouts_completed = COALESCE($2, total_workouts_completed),
           current_streak_days = COALESCE($3, current_streak_days),
           longest_streak_days = COALESCE($4, longest_streak_days),
           last_workout_date = COALESCE($5, last_workout_date),
           lift_progression = COALESCE($6, lift_progression),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [
        userId,
        stats.total_workouts_completed,
        stats.current_streak_days,
        stats.longest_streak_days,
        stats.last_workout_date,
        stats.lift_progression ? JSON.stringify(stats.lift_progression) : null
      ]
    );
    return result.rows[0];
  }

  static async incrementWorkoutCompleted(userId) {
    // Get current stats
    const stats = await this.findOrCreate(userId);
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = stats.last_workout_date;

    let newStreak = 1;

    if (lastWorkout) {
      const lastDate = new Date(lastWorkout);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak = stats.current_streak_days + 1;
      } else if (diffDays === 0) {
        // Same day - keep streak
        newStreak = stats.current_streak_days;
      }
      // If diffDays > 1, streak resets to 1
    }

    const newLongestStreak = Math.max(newStreak, stats.longest_streak_days);

    const result = await pool.query(
      `UPDATE progress_stats
       SET total_workouts_completed = total_workouts_completed + 1,
           current_streak_days = $2,
           longest_streak_days = $3,
           last_workout_date = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1
       RETURNING *`,
      [userId, newStreak, newLongestStreak, today]
    );

    return result.rows[0];
  }

  static async getWeeklyActivity(userId) {
    // Get workouts completed in the last 7 days
    const result = await pool.query(
      `SELECT workout_date, COUNT(*) as count
       FROM workout_logs
       WHERE user_id = $1
         AND workout_date >= CURRENT_DATE - INTERVAL '7 days'
         AND completed = true
       GROUP BY workout_date
       ORDER BY workout_date`,
      [userId]
    );
    return result.rows;
  }
}

module.exports = ProgressStats;
