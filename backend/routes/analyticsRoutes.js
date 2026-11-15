const express = require('express');
module.exports = (analytics, motivation) => {
  const r = express.Router();
  r.get('/stats', analytics.stats);
  r.get('/heatmap', analytics.heatmap);
  r.get('/motivation', motivation.get);
  r.get('/analytics/categories', analytics.categories);
  return r;
};
