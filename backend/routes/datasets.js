const express = require('express');
const ctrl = require('../controllers/datasets');
const router = express.Router();

router.get('/datasets', ctrl.list);
router.get('/datasets/:id', ctrl.get);
router.get('/datasets/:id/fields', ctrl.fields);
router.get('/datasets/:id/records', ctrl.records);

module.exports = router;
