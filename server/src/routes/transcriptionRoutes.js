const express = require('express');
const router = express.Router();
const multer = require('multer');
const { transcribe } = require('../controllers/transcriptionController');
const auth = require('../middleware/auth');

// Configure multer for memory storage (we'll send buffer to Deepgram)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/', auth, upload.single('audio'), transcribe);

module.exports = router;
