const express = require('express');
const { aggregate } = require('../controllers/aggregate');
const router = express.Router();

router.post('/aggregate', aggregate);

module.exports = router;
