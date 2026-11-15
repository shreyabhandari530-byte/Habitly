const { send } = require('../utils/responseHelper');
module.exports = ({ habits }) => ({
  list: (req, res) => send(res, habits.list()),
  create: (req, res) => send(res, habits.create(req.body), 201),
  update: (req, res) => send(res, habits.update(req.habitId, req.body)),
  remove: (req, res) => { habits.remove(req.habitId); send(res, { message: 'Habit deleted successfully' }); },
  checkIn: (req, res) => send(res, habits.checkIn(req.habitId, req.body)),
  history: (req, res) => send(res, habits.history(req.range.from, req.range.to)),
});
