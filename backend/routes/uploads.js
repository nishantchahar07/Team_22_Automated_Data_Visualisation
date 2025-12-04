const express = require('express');
const ctrl = require('../controllers/uploads');
const router = express.Router();

router.get('/uploads', ctrl.list);
router.get('/uploads/:id', ctrl.get);

module.exports = router;
