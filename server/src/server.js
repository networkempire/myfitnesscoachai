require('dotenv').config();

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const intakeRoutes = require('./routes/intake');
const programRoutes = require('./routes/program');
const statsRoutes = require('./routes/statsRoutes');
const workoutLogRoutes = require('./routes/workoutLogRoutes');
const transcriptionRoutes = require('./routes/transcriptionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/intake', intakeRoutes);
app.use('/api/program', programRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/workout-log', workoutLogRoutes);
app.use('/api/transcribe', transcriptionRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
