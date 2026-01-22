const ProgressStats = require('../models/ProgressStats');

const getStats = async (req, res, next) => {
  try {
    const stats = await ProgressStats.findOrCreate(req.user.id);
    const weeklyActivity = await ProgressStats.getWeeklyActivity(req.user.id);

    // Calculate days active this week
    const daysActiveThisWeek = weeklyActivity.length;

    res.json({
      total_workouts_completed: stats.total_workouts_completed,
      current_streak_days: stats.current_streak_days,
      longest_streak_days: stats.longest_streak_days,
      last_workout_date: stats.last_workout_date,
      days_active_this_week: daysActiveThisWeek,
      weekly_activity: weeklyActivity
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
