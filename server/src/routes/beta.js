const express = require('express');
const router = express.Router();
const { submitBetaRequest } = require('../controllers/betaController');

// Public endpoint for beta form submission
router.post('/request', submitBetaRequest);

module.exports = router;
