const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const {
  getBetaRequests,
  approveBetaRequest,
  rejectBetaRequest,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist
} = require('../controllers/adminController');

// All admin routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

// Beta request management
router.get('/beta-requests', getBetaRequests);
router.post('/beta-requests/:id/approve', approveBetaRequest);
router.post('/beta-requests/:id/reject', rejectBetaRequest);

// Whitelist management
router.get('/whitelist', getWhitelist);
router.post('/whitelist', addToWhitelist);
router.delete('/whitelist/:id', removeFromWhitelist);

module.exports = router;
