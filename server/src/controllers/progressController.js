const WorkoutLog = require('../models/WorkoutLog');
const ProgressStats = require('../models/ProgressStats');

const getWeightProgression = async (req, res, next) => {
  try {
    const { exercise } = req.query;

    const progression = await WorkoutLog.getWeightProgression(req.user.id, exercise);

    res.json({ progression });
  } catch (error) {
    next(error);
  }
};

const getExerciseList = async (req, res, next) => {
  try {
    const exercises = await WorkoutLog.getExerciseList(req.user.id);

    res.json({ exercises });
  } catch (error) {
    next(error);
  }
};

const getWorkoutHistory = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const workouts = await WorkoutLog.findRecentByUser(req.user.id, days);

    res.json({ workouts });
  } catch (error) {
    next(error);
  }
};

const getFullStats = async (req, res, next) => {
  try {
    const stats = await ProgressStats.findOrCreate(req.user.id);
    const weeklyActivity = await ProgressStats.getWeeklyActivity(req.user.id);
    const recentWorkouts = await WorkoutLog.findRecentByUser(req.user.id, 10);

    // Calculate additional stats
    const thisWeekCompleted = weeklyActivity.length;

    res.json({
      total_workouts_completed: stats.total_workouts_completed,
      current_streak_days: stats.current_streak_days,
      longest_streak_days: stats.longest_streak_days,
      last_workout_date: stats.last_workout_date,
      days_active_this_week: thisWeekCompleted,
      weekly_activity: weeklyActivity,
      recent_workouts: recentWorkouts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeightProgression,
  getExerciseList,
  getWorkoutHistory,
  getFullStats
};
