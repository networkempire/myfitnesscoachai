import api from './api';

export const generateProgram = async (conversationId) => {
  const response = await api.post('/program/generate', {
    conversation_id: conversationId
  });
  return response.data;
};

export const getActiveProgram = async () => {
  const response = await api.get('/program/active');
  return response.data;
};

export const getProgramById = async (programId) => {
  const response = await api.get(`/program/${programId}`);
  return response.data;
};

export const getAllPrograms = async () => {
  const response = await api.get('/program/all');
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Workout logging
export const startWorkout = async (dayName, sessionName, exercises) => {
  const response = await api.post('/workout-log/start', {
    day_name: dayName,
    session_name: sessionName,
    exercises
  });
  return response.data;
};

export const updateExerciseLog = async (logId, exerciseIndex, data) => {
  const response = await api.put(`/workout-log/${logId}/exercise`, {
    exercise_index: exerciseIndex,
    ...data
  });
  return response.data;
};

export const completeWorkout = async (logId, durationMinutes, notes) => {
  const response = await api.post(`/workout-log/${logId}/complete`, {
    duration_minutes: durationMinutes,
    notes
  });
  return response.data;
};

export const getTodaysWorkoutLog = async (dayName) => {
  const response = await api.get(`/workout-log/today?day_name=${dayName}`);
  return response.data;
};

export const getRecentWorkouts = async () => {
  const response = await api.get('/workout-log/recent');
  return response.data;
};

// Progress tracking
export const getWeightProgression = async (exercise = null) => {
  const url = exercise
    ? `/progress/progression?exercise=${encodeURIComponent(exercise)}`
    : '/progress/progression';
  const response = await api.get(url);
  return response.data;
};

export const getExerciseList = async () => {
  const response = await api.get('/progress/exercises');
  return response.data;
};

export const getFullStats = async () => {
  const response = await api.get('/progress/stats');
  return response.data;
};

export const getWorkoutHistory = async (days = 30) => {
  const response = await api.get(`/progress/history?days=${days}`);
  return response.data;
};
