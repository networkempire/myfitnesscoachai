const Conversation = require('../models/Conversation');
const ProfileUpdate = require('../models/ProfileUpdate');
const Program = require('../models/Program');
const { sendUpdateMessage, extractProfileChanges, generateAllPrograms } = require('../services/claudeService');
const { deepMerge } = require('../utils/deepMerge');
const pool = require('../config/database');

/**
 * Get the user's current profile data from their most recent completed conversation
 */
async function getCurrentProfile(req, res, next) {
  try {
    const userId = req.user.id;

    // Get most recent completed conversation with extracted data
    const result = await pool.query(
      `SELECT id, extracted_data FROM conversations
       WHERE user_id = $1 AND completed = TRUE AND extracted_data IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (!result.rows[0] || !result.rows[0].extracted_data) {
      return res.status(404).json({ error: 'No profile data found. Please complete an intake first.' });
    }

    res.json({
      conversation_id: result.rows[0].id,
      profile_data: result.rows[0].extracted_data
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Start a profile update conversation
 */
async function startUpdate(req, res, next) {
  try {
    const userId = req.user.id;

    // Get current profile data
    const profileResult = await pool.query(
      `SELECT id, extracted_data FROM conversations
       WHERE user_id = $1 AND completed = TRUE AND extracted_data IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (!profileResult.rows[0] || !profileResult.rows[0].extracted_data) {
      return res.status(400).json({ error: 'No profile data found. Please complete an intake first.' });
    }

    const currentProfile = profileResult.rows[0].extracted_data;
    const conversationId = profileResult.rows[0].id;

    // Get the starter message
    const starterMessage = await sendUpdateMessage([], currentProfile);

    res.status(201).json({
      conversation_id: conversationId,
      messages: [{ role: 'assistant', content: starterMessage, timestamp: new Date().toISOString() }],
      profile_data: currentProfile
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send a message in the profile update conversation
 */
async function sendMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { conversation_id, message, messages: existingMessages } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Get current profile data
    const profileResult = await pool.query(
      `SELECT id, extracted_data FROM conversations
       WHERE user_id = $1 AND completed = TRUE AND extracted_data IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (!profileResult.rows[0] || !profileResult.rows[0].extracted_data) {
      return res.status(400).json({ error: 'No profile data found.' });
    }

    const currentProfile = profileResult.rows[0].extracted_data;

    // Build conversation history from existing messages + new user message
    const conversationHistory = [
      ...(existingMessages || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    // Get AI response
    const aiResponse = await sendUpdateMessage(conversationHistory, currentProfile);

    // Check if update is complete
    const isComplete = aiResponse.includes('UPDATE_COMPLETE');

    let finalResponse = aiResponse;
    let extractedChanges = null;

    if (isComplete) {
      // Extract the changes from the conversation
      extractedChanges = await extractProfileChanges(conversationHistory, currentProfile);

      // Clean up the response
      finalResponse = aiResponse.replace('UPDATE_COMPLETE', '').trim();
      if (!finalResponse) {
        finalResponse = "Got it! I've noted all your updates. Would you like me to regenerate your programs to reflect these changes?";
      }
    }

    res.json({
      response: finalResponse,
      completed: isComplete,
      extracted_changes: extractedChanges
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Confirm and save profile changes, optionally regenerate programs
 */
async function confirmUpdate(req, res, next) {
  try {
    const userId = req.user.id;
    const { messages, changes, regenerate_programs } = req.body;

    if (!changes) {
      return res.status(400).json({ error: 'changes object is required' });
    }

    // Get current profile data and conversation
    const profileResult = await pool.query(
      `SELECT id, extracted_data FROM conversations
       WHERE user_id = $1 AND completed = TRUE AND extracted_data IS NOT NULL
       ORDER BY updated_at DESC LIMIT 1`,
      [userId]
    );

    if (!profileResult.rows[0] || !profileResult.rows[0].extracted_data) {
      return res.status(400).json({ error: 'No profile data found.' });
    }

    const conversationId = profileResult.rows[0].id;
    const currentProfile = profileResult.rows[0].extracted_data;

    // Merge changes into current profile
    const updatedProfile = deepMerge(currentProfile, changes.changes || {});

    // Update the conversation's extracted_data with merged profile
    await pool.query(
      `UPDATE conversations SET extracted_data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [JSON.stringify(updatedProfile), conversationId]
    );

    // Create audit record
    const profileUpdate = await ProfileUpdate.create(
      userId,
      conversationId,
      messages || [],
      changes,
      changes.update_type || 'other',
      regenerate_programs || false
    );

    let newProgram = null;

    // Regenerate programs if requested
    if (regenerate_programs) {
      const programs = await generateAllPrograms(updatedProfile);

      newProgram = await Program.create(
        userId,
        conversationId,
        programs.workout.program_name || 'Updated Program',
        programs.workout,
        programs.nutrition,
        programs.flexibility
      );

      // Update the profile update record
      await ProfileUpdate.updateProgramsRegenerated(profileUpdate.id, true);
    }

    res.json({
      success: true,
      profile_update_id: profileUpdate.id,
      updated_profile: updatedProfile,
      programs_regenerated: regenerate_programs || false,
      new_program: newProgram ? {
        id: newProgram.id,
        program_name: newProgram.program_name
      } : null
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentProfile,
  startUpdate,
  sendMessage,
  confirmUpdate
};
