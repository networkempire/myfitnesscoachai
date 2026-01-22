import api from './api';

export const startIntake = async () => {
  const response = await api.post('/intake/start');
  return response.data;
};

export const sendMessage = async (conversationId, message) => {
  const response = await api.post('/intake/message', {
    conversation_id: conversationId,
    message
  });
  return response.data;
};

export const getConversation = async (conversationId) => {
  const response = await api.get(`/intake/${conversationId}`);
  return response.data;
};

export const transcribeAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');

  const response = await api.post('/transcribe', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
