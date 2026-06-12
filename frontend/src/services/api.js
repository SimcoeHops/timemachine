import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/game';

export const startNewGame = async () => {
  const res = await axios.post(`${API_BASE}/start`);
  return res.data;
};

export const fetchGameState = async (gameId) => {
  const res = await axios.get(`${API_BASE}/${gameId}`);
  return res.data;
};

export const submitChoiceAndProgress = async (gameId, choiceId) => {
  const res = await axios.post(`${API_BASE}/choice`, { gameId, choiceId });
  return res.data;
};
