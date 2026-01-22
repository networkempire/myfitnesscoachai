const express = require('express');
const router = express.Router();
const { generate, getActive, getById, getAll } = require('../controllers/programController');
const authMiddleware = require('../middleware/auth');

// All program routes require authentication
router.use(authMiddleware);

router.post('/generate', generate);
router.get('/active', getActive);
router.get('/all', getAll);
router.get('/:program_id', getById);

module.exports = router;
