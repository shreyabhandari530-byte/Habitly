const { isISODate, today, daysBetween, addDays } = require('../utils/dateUtils');
const { validationError } = require('../utils/responseHelper');

const CATEGORIES = ['Health', 'Fitness', 'Study', 'Productivity', 'Personal Development', 'Other'];
const obj = b => (b && typeof b === 'object' && !Array.isArray(b) ? b : {});

function validateHabitInput(body) {
  const b = obj(body), errors = {};
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (title.length < 2) errors.title = 'Title must be at least 2 characters.';
  else if (title.length > 60) errors.title = 'Title must be 60 characters or fewer.';
  let description = '';
  if (b.description !== undefined && b.description !== null) {
    if (typeof b.description !== 'string') errors.description = 'Description must be text.';
    else { description = b.description.trim(); if (description.length > 300) errors.description = 'Description must be 300 characters or fewer.'; }
  }
  if (!CATEGORIES.includes(b.category)) errors.category = `Category must be one of: ${CATEGORIES.join(', ')}.`;
  if (!isISODate(b.start_date)) errors.start_date = 'Start date must be a valid date in YYYY-MM-DD format.';
  const wd = b.weekdays;
  if (!Array.isArray(wd) || wd.length === 0) errors.weekdays = 'Select at least one weekday.';
  else if (!wd.every(d => Number.isInteger(d) && d >= 0 && d <= 6)) errors.weekdays = 'Weekdays must be integers from 0 (Sun) to 6 (Sat).';
  const value = { title, description, category: b.category, start_date: b.start_date, weekdays: Array.isArray(wd) ? [...new Set(wd)].sort() : [] };
  return { errors, value };
}

const validateHabit = (req, res, next) => {
  const { errors, value } = validateHabitInput(req.body);
  if (Object.keys(errors).length) return next(validationError(errors));
  req.body = value; next();
};
const validateId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return next(validationError({ id: 'Habit id must be a positive integer.' }, 'Invalid habit id'));
  req.habitId = id; next();
};
const validateCheckIn = (req, res, next) => {
  const b = obj(req.body), errors = {};
  const date = b.date === undefined ? today() : b.date;
  if (!isISODate(date)) errors.date = 'Date must be a valid date in YYYY-MM-DD format.';
  if (b.completed !== undefined && typeof b.completed !== 'boolean') errors.completed = 'Completed must be true or false.';
  if (Object.keys(errors).length) return next(validationError(errors));
  req.body = { date, completed: b.completed === undefined ? true : b.completed }; next();
};
const validateHistoryQuery = (req, res, next) => {
  const to = req.query.to === undefined ? today() : req.query.to;
  const from = req.query.from === undefined ? addDays(to, -30) : req.query.from, errors = {};
  if (!isISODate(from)) errors.from = 'from must be a valid date in YYYY-MM-DD format.';
  if (!isISODate(to)) errors.to = 'to must be a valid date in YYYY-MM-DD format.';
  if (!errors.from && !errors.to) {
    if (from > to) errors.from = 'from must not be after to.';
    else if (daysBetween(from, to) > 400) errors.to = 'Date range cannot exceed 400 days.';
  }
  if (Object.keys(errors).length) return next(validationError(errors));
  req.range = { from, to }; next();
};
module.exports = { CATEGORIES, validateHabitInput, validateHabit, validateId, validateCheckIn, validateHistoryQuery };
