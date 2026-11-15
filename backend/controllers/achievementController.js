const { send } = require('../utils/responseHelper');
module.exports = ({ achievements }) => ({ get: (req, res) => send(res, achievements.get()) });
