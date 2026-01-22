const WorkoutLog = require('../models/WorkoutLog');
const Program = require('../models/Program');
const ProgressStats = require('../models/ProgressStats');
const pool = require('../config/database');

const startWorkout = async (req, res, next) => {
  try {
    const { day_name, session_name, exercises } = req.body;

    // Get active program
    const program = await Program.findActiveByUserId(req.user.id);
    if (!program) {
      return res.status(404).json({ error: 'No active program found' });
    }

    // Check if there's already a log for today
    const existingLog = await WorkoutLog.getTodaysLog(req.user.id, program.id, day_name);
    if (existingLog) {
      return res.json({
        log_id: existingLog.id,
        exercises_logged: existingLog.exercises_logged,
        completed: existingLog.completed,
        resumed: true
      });
    }

    // Get last used weights for this day's exercises
    const lastWeights = await WorkoutLog.getLastWeightsForDay(req.user.id, day_name);

    // Create initial exercise log structure, pre-filling with last used weights
    const exercisesLogged = exercises.map((exercise, index) => ({
      index,
      name: exercise.name,
      sets_completed: 0,
      sets_total: exercise.sets,
      reps_target: exercise.reps,
      weight_used: lastWeights?.[exercise.name] || exercise.weight || '',
      sets_data: []
    }));

    const today = new Date().toISOString().split('T')[0];

    const log = await WorkoutLog.create(req.user.id, program.id, {
      workout_date: today,
      day_name,
      session_name,
      exercises_logged: exercisesLogged,
      completed: false,
      duration_minutes: null,
      notes: null
    });

    res.status(201).json({
      log_id: log.id,
      exercises_logged: log.exercises_logged,
      completed: false,
      resumed: false
    });
  } catch (error) {
    next(error);
  }
};

const updateExercise = async (req, res, next) => {
  try {
    const { log_id } = req.params;
    const { exercise_index, sets_completed, weight_used, set_data } = req.body;

    const log = await WorkoutLog.findById(log_id);
    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    if (log.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (log.completed) {
      return res.status(400).json({ error: 'Workout already completed' });
    }

    const exercisesLogged = log.exercises_logged;
    const exercise = exercisesLogged[exercise_index];

    if (!exercise) {
      return res.status(400).json({ error: 'Invalid exercise index' });
    }

    // Update exercise data
    if (sets_completed !== undefined) {
      exercise.sets_completed = sets_completed;
    }
    if (weight_used !== undefined) {
      exercise.weight_used = weight_used;
    }
    if (set_data) {
      exercise.sets_data.push(set_data);
    }

    await WorkoutLog.updateExercises(log_id, req.user.id, exercisesLogged);

    res.json({ success: true, exercises_logged: exercisesLogged });
  } catch (error) {
    next(error);
  }
};

const completeWorkout = async (req, res, next) => {
  try {
    const { log_id } = req.params;
    const { duration_minutes, notes } = req.body;

    const log = await WorkoutLog.findById(log_id);
    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }

    if (log.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (log.completed) {
      return res.status(400).json({ error: 'Workout already completed' });
    }

    // Mark workout as completed
    await WorkoutLog.markCompleted(log_id, req.user.id);

    // Update duration and notes if provided
    if (duration_minutes || notes) {
      await pool.query(
        `UPDATE workout_logs SET duration_minutes = COALESCE($1, duration_minutes), notes = COALESCE($2, notes) WHERE id = $3`,
        [duration_minutes, notes, log_id]
      );
    }

    // Update progress stats
    await ProgressStats.incrementWorkoutCompleted(req.user.id);

    // Get updated stats
    const stats = await ProgressStats.findByUserId(req.user.id);

    res.json({
      success: true,
      message: 'Workout completed! Great job!',
      stats: {
        total_workouts_completed: stats.total_workouts_completed,
        current_streak_days: stats.current_streak_days,
        longest_streak_days: stats.longest_streak_days
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTodaysWorkout = async (req, res, next) => {
  try {
    const { day_name } = req.query;

    const program = await Program.findActiveByUserId(req.user.id);
    if (!program) {
      return res.status(404).json({ error: 'No active program found' });
    }

    const log = await WorkoutLog.getTodaysLog(req.user.id, program.id, day_name);

    if (!log) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      log_id: log.id,
      exercises_logged: log.exercises_logged,
      completed: log.completed
    });
  } catch (error) {
    next(error);
  }
};

const getRecentWorkouts = async (req, res, next) => {
  try {
    const logs = await WorkoutLog.findRecentByUser(req.user.id, 10);
    res.json({ workouts: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startWorkout,
  updateExercise,
  completeWorkout,
  getTodaysWorkout,
  getRecentWorkouts
};
