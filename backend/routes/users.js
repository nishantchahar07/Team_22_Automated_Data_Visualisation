const express = require('express');
const ctrl = require('../controllers/users');
const router = express.Router();

router.get('/users', ctrl.list);
router.get('/users/:id', ctrl.get);

module.exports = router;
