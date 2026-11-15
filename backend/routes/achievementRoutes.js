const express = require('express');
module.exports = c => { const r = express.Router(); r.get('/achievements', c.get); return r; };
