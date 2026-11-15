const { send } = require('../utils/responseHelper');
module.exports = ({ analytics }) => ({ get: (req, res) => send(res, analytics.motivation()) });
