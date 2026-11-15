const { send } = require('../utils/responseHelper');
module.exports = ({ statistics, analytics }) => ({
  stats: (req, res) => send(res, statistics.stats()),
  heatmap: (req, res) => send(res, analytics.heatmap()),
  categories: (req, res) => send(res, analytics.categories()),
});
