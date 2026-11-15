const express = require('express');
const v = require('../middleware/validateHabit');
module.exports = c => {
  const r = express.Router();
  r.get('/', c.list);
  r.post('/', v.validateHabit, c.create);
  r.get('/history', v.validateHistoryQuery, c.history);
  r.put('/:id', v.validateId, v.validateHabit, c.update);
  r.delete('/:id', v.validateId, c.remove);
  r.post('/:id/check-in', v.validateId, v.validateCheckIn, c.checkIn);
  return r;
};
