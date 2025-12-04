const express = require('express');
const ctrl = require('../controllers/chartFilters');
const router = express.Router();

router.get('/charts/:chartId/filters', ctrl.byChart);

module.exports = router;
