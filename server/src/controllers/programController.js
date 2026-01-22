const Program = require('../models/Program');
const Conversation = require('../models/Conversation');
const { generateAllPrograms } = require('../services/claudeService');

const generate = async (req, res, next) => {
  try {
    const { conversation_id } = req.body;

    if (!conversation_id) {
      return res.status(400).json({ error: 'conversation_id is required' });
    }

    // Get conversation and verify ownership
    const conversation = await Conversation.findById(conversation_id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!conversation.completed) {
      return res.status(400).json({ error: 'Intake conversation must be completed first' });
    }

    if (!conversation.extracted_data) {
      return res.status(400).json({ error: 'No user data extracted from conversation' });
    }

    // Generate all three programs
    const userData = conversation.extracted_data;
    const programs = await generateAllPrograms(userData);

    // Create program name from user's goal
    const programName = `${userData.goals?.primary_goal || 'Fitness'} Program`;

    // Save to database
    const savedProgram = await Program.create(
      req.user.id,
      conversation_id,
      programName,
      programs.workout,
      programs.nutrition,
      programs.flexibility
    );

    res.status(201).json({
      success: true,
      program_id: savedProgram.id,
      program_name: savedProgram.program_name,
      workout: programs.workout,
      nutrition: programs.nutrition,
      flexibility: programs.flexibility
    });
  } catch (error) {
    next(error);
  }
};

const getActive = async (req, res, next) => {
  try {
    const program = await Program.findActiveByUserId(req.user.id);

    if (!program) {
      return res.status(404).json({ error: 'No active program found' });
    }

    res.json({
      id: program.id,
      program_name: program.program_name,
      workout: program.workout_program,
      nutrition: program.nutrition_plan,
      flexibility: program.flexibility_program,
      created_at: program.created_at
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const { program_id } = req.params;

    const program = await Program.findById(program_id);

    if (!program) {
      return res.status(404).json({ error: 'Program not found' });
    }

    if (program.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      id: program.id,
      program_name: program.program_name,
      workout: program.workout_program,
      nutrition: program.nutrition_plan,
      flexibility: program.flexibility_program,
      is_active: program.is_active,
      created_at: program.created_at
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const programs = await Program.findAllByUserId(req.user.id);

    res.json({
      programs: programs.map(p => ({
        id: p.id,
        program_name: p.program_name,
        is_active: p.is_active,
        created_at: p.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generate, getActive, getById, getAll };
