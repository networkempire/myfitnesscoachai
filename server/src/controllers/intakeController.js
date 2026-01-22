const Conversation = require('../models/Conversation');
const { sendIntakeMessage, extractUserData } = require('../services/claudeService');

const startIntake = async (req, res, next) => {
  try {
    // Check if user has an active (incomplete) conversation
    let conversation = await Conversation.findActiveByUserId(req.user.id);

    if (conversation) {
      const messages = conversation.messages || [];

      // If existing conversation has messages, resume it
      if (messages.length > 0) {
        return res.json({
          conversation_id: conversation.id,
          messages: messages
        });
      }

      // If existing conversation is empty (failed start), add the greeting
      const initialMessage = await sendIntakeMessage([]);
      await Conversation.addMessage(conversation.id, 'assistant', initialMessage);

      return res.json({
        conversation_id: conversation.id,
        messages: [{ role: 'assistant', content: initialMessage, timestamp: new Date().toISOString() }]
      });
    }

    // Create new conversation
    conversation = await Conversation.create(req.user.id);

    // Get initial greeting
    const initialMessage = await sendIntakeMessage([]);

    // Save the assistant's greeting
    await Conversation.addMessage(conversation.id, 'assistant', initialMessage);

    res.status(201).json({
      conversation_id: conversation.id,
      messages: [{ role: 'assistant', content: initialMessage, timestamp: new Date().toISOString() }]
    });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversation_id, message } = req.body;

    if (!conversation_id || !message) {
      return res.status(400).json({ error: 'conversation_id and message are required' });
    }

    // Get conversation and verify ownership
    const conversation = await Conversation.findById(conversation_id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }

    if (conversation.completed) {
      return res.status(400).json({ error: 'This intake conversation is already completed' });
    }

    // Add user message to conversation
    await Conversation.addMessage(conversation_id, 'user', message);

    // Get messages in Claude format
    const claudeMessages = await Conversation.getMessagesForClaude(conversation_id);

    // Get AI response
    const aiResponse = await sendIntakeMessage(claudeMessages);

    // Check if intake is complete
    const isComplete = aiResponse.includes('INTAKE_COMPLETE');

    let finalResponse = aiResponse;
    let extractedData = null;

    if (isComplete) {
      // Extract structured data from conversation
      extractedData = await extractUserData(claudeMessages);

      // Mark conversation as complete
      await Conversation.complete(conversation_id, extractedData);

      // Clean up the response
      finalResponse = aiResponse.replace('INTAKE_COMPLETE', '').trim();
      if (!finalResponse) {
        finalResponse = "I've got everything I need to create your personalized program. Let's build something amazing together!";
      }
    }

    // Save assistant response
    await Conversation.addMessage(conversation_id, 'assistant', finalResponse);

    res.json({
      response: finalResponse,
      completed: isComplete,
      extracted_data: extractedData
    });
  } catch (error) {
    next(error);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const { conversation_id } = req.params;

    const conversation = await Conversation.findById(conversation_id);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }

    res.json({
      conversation_id: conversation.id,
      messages: conversation.messages || [],
      extracted_data: conversation.extracted_data,
      completed: conversation.completed
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { startIntake, sendMessage, getConversation };
