import api from './api';
import { normalizeHeatmap, normalizeCategories } from './apiContract';
export const analyticsService = {
  heatmap: async () => normalizeHeatmap((await api.get('/habits/heatmap')).data),
  categories: async () => normalizeCategories((await api.get('/habits/analytics/categories')).data),
};
