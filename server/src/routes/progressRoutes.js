const express = require('express');
const router = express.Router();
const {
  getWeightProgression,
  getExerciseList,
  getWorkoutHistory,
  getFullStats
} = require('../controllers/progressController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getFullStats);
router.get('/progression', auth, getWeightProgression);
router.get('/exercises', auth, getExerciseList);
router.get('/history', auth, getWorkoutHistory);

module.exports = router;
