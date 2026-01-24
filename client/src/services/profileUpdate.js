import api from './api';

/**
 * Get the user's current profile data
 */
export const getCurrentProfile = async () => {
  const response = await api.get('/profile-update/current');
  return response.data;
};

/**
 * Start a profile update conversation
 */
export const startProfileUpdate = async () => {
  const response = await api.post('/profile-update/start');
  return response.data;
};

/**
 * Send a message in the profile update conversation
 */
export const sendProfileUpdateMessage = async (conversationId, message, messages) => {
  const response = await api.post('/profile-update/message', {
    conversation_id: conversationId,
    message,
    messages
  });
  return response.data;
};

/**
 * Confirm and save profile changes
 */
export const confirmProfileUpdate = async (messages, changes, regeneratePrograms) => {
  const response = await api.post('/profile-update/confirm', {
    messages,
    changes,
    regenerate_programs: regeneratePrograms
  });
  return response.data;
};
