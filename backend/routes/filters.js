const express = require('express');
const ctrl = require('../controllers/filters');
const router = express.Router();

router.get('/dashboards/:dashboardId/filters', ctrl.byDashboard);

module.exports = router;
