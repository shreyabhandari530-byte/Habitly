import api from './api';
import { normalizeAchievements } from './apiContract';
export const achievementService = { get: async () => normalizeAchievements((await api.get('/habits/achievements')).data) };
