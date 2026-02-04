import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const submitBetaRequest = async (name, email) => {
  const response = await axios.post(`${API_URL}/beta/request`, { name, email });
  return response.data;
};
