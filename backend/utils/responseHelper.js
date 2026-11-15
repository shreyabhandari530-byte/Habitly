class AppError extends Error {
  constructor(status, message, errors) { super(message); this.status = status; if (errors) this.errors = errors; }
}
const validationError = (errors, message = 'Validation failed') => new AppError(400, message, errors);
const notFoundError = (message = 'Habit not found') => new AppError(404, message);
const conflictError = message => new AppError(409, message);
const send = (res, data, status = 200) => res.status(status).json(data);
module.exports = { AppError, validationError, notFoundError, conflictError, send };
