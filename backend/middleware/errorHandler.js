const { AppError } = require('../utils/responseHelper');
// Consistent JSON errors: { message, errors? }. Internal details are logged, never returned.
module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof AppError) return res.status(err.status).json(err.errors ? { message: err.message, errors: err.errors } : { message: err.message });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Request body must be valid JSON.' });
  if (err.type && err.status >= 400 && err.status < 500) return res.status(err.status).json({ message: 'Invalid request body.' });
  if (process.env.NODE_ENV !== 'test') console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ message: 'Internal server error. Please try again.' });
};
