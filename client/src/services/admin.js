import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const getBetaRequests = async (status = null) => {
  const params = status ? { status } : {};
  const response = await axios.get(`${API_URL}/admin/beta-requests`, {
    headers: getAuthHeader(),
    params
  });
  return response.data;
};

export const approveBetaRequest = async (id) => {
  const response = await axios.post(
    `${API_URL}/admin/beta-requests/${id}/approve`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const rejectBetaRequest = async (id) => {
  const response = await axios.post(
    `${API_URL}/admin/beta-requests/${id}/reject`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getWhitelist = async () => {
  const response = await axios.get(`${API_URL}/admin/whitelist`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const addToWhitelist = async (email, notes = null) => {
  const response = await axios.post(
    `${API_URL}/admin/whitelist`,
    { email, notes },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const removeFromWhitelist = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/whitelist/${id}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
