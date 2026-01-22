const express = require('express');
const router = express.Router();
const {
  startWorkout,
  updateExercise,
  completeWorkout,
  getTodaysWorkout,
  getRecentWorkouts
} = require('../controllers/workoutLogController');
const auth = require('../middleware/auth');

router.post('/start', auth, startWorkout);
router.put('/:log_id/exercise', auth, updateExercise);
router.post('/:log_id/complete', auth, completeWorkout);
router.get('/today', auth, getTodaysWorkout);
router.get('/recent', auth, getRecentWorkouts);

module.exports = router;
