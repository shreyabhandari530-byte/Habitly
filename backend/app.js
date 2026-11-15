const express = require('express');
const cors = require('cors');
const { createServices } = require('./services');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

function createApp(db) {
  const services = createServices(db);
  const app = express();
  const origins = [...new Set([process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'])];
  app.disable('x-powered-by');
  app.use(cors({ origin: origins }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/api', (req, res) => res.json({ name: 'Habitly API', status: 'ok' }));
  // Static paths (stats, heatmap, ...) are registered before the /:id routes.
  app.use('/api/habits',
    require('./routes/analyticsRoutes')(require('./controllers/analyticsController')(services), require('./controllers/motivationController')(services)),
    require('./routes/achievementRoutes')(require('./controllers/achievementController')(services)),
    require('./routes/habitRoutes')(require('./controllers/habitController')(services)));
  app.use(notFound);
  app.use(errorHandler);
  return { app, services };
}
module.exports = { createApp };
