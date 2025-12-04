const express = require('express');
const ctrl = require('../controllers/dashboards');
const router = express.Router();

router.get('/dashboards/:id', ctrl.get);
router.get('/datasets/:datasetId/dashboards', ctrl.byDataset);
router.get('/dashboards/:id/charts', ctrl.charts);

module.exports = router;
