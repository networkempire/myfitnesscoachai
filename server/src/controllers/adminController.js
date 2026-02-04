const BetaRequest = require('../models/BetaRequest');
const EmailWhitelist = require('../models/EmailWhitelist');

const getBetaRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const requests = await BetaRequest.findAll(status || null);
    res.json({ requests });
  } catch (error) {
    next(error);
  }
};

const approveBetaRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await BetaRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Beta request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    // Update status to approved
    await BetaRequest.updateStatus(id, 'approved');

    // Add to whitelist
    const existingWhitelist = await EmailWhitelist.findByEmail(request.email);
    if (!existingWhitelist) {
      await EmailWhitelist.add(request.email, req.user.id, `Approved from beta request #${id}`);
    }

    res.json({ message: 'Beta request approved and email added to whitelist' });
  } catch (error) {
    next(error);
  }
};

const rejectBetaRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await BetaRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'Beta request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'This request has already been processed' });
    }

    await BetaRequest.updateStatus(id, 'rejected');
    res.json({ message: 'Beta request rejected' });
  } catch (error) {
    next(error);
  }
};

const getWhitelist = async (req, res, next) => {
  try {
    const whitelist = await EmailWhitelist.findAll();
    res.json({ whitelist });
  } catch (error) {
    next(error);
  }
};

const addToWhitelist = async (req, res, next) => {
  try {
    const { email, notes } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Check if already whitelisted
    const existing = await EmailWhitelist.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'This email is already whitelisted' });
    }

    const entry = await EmailWhitelist.add(email, req.user.id, notes || null);
    res.status(201).json({ message: 'Email added to whitelist', entry });
  } catch (error) {
    next(error);
  }
};

const removeFromWhitelist = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await EmailWhitelist.remove(id);
    if (!entry) {
      return res.status(404).json({ error: 'Whitelist entry not found' });
    }

    res.json({ message: 'Email removed from whitelist' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBetaRequests,
  approveBetaRequest,
  rejectBetaRequest,
  getWhitelist,
  addToWhitelist,
  removeFromWhitelist
};
