const pool = require('../config/database');

const Conversation = {
  async create(userId) {
    const result = await pool.query(
      `INSERT INTO conversations (user_id, messages)
       VALUES ($1, $2)
       RETURNING id, user_id, messages, extracted_data, completed, created_at`,
      [userId, JSON.stringify([])]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findActiveByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE user_id = $1 AND completed = FALSE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  async addMessage(id, role, content) {
    const conversation = await this.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const messages = conversation.messages || [];
    messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });

    const result = await pool.query(
      `UPDATE conversations
       SET messages = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(messages), id]
    );
    return result.rows[0];
  },

  async complete(id, extractedData) {
    const result = await pool.query(
      `UPDATE conversations
       SET completed = TRUE, extracted_data = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(extractedData), id]
    );
    return result.rows[0];
  },

  async getMessagesForClaude(id) {
    const conversation = await this.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Convert to Claude's message format (without timestamps)
    return (conversation.messages || []).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
};

module.exports = Conversation;
