import api from './api';

export const signup = async (email, password) => {
  const response = await api.post('/auth/signup', { email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const verify = async () => {
  const response = await api.post('/auth/verify');
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.post('/auth/reset-password', { token, password });
  return response.data;
};

export const validateResetToken = async (token) => {
  const response = await api.get(`/auth/validate-reset-token?token=${token}`);
  return response.data;
};
