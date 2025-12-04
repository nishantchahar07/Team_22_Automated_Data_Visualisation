const express = require('express');
const ctrl = require('../controllers/charts');
const router = express.Router();

router.get('/charts/:id', ctrl.get);

module.exports = router;
