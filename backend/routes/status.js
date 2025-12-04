const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.send('API is running successfully!');
});

router.get('/status', (_req, res) => {
  const mongoose = require('mongoose');
  const state = mongoose.connection.readyState;
  res.json({
    status: state === 1 ? 'running' : 'degraded',
    services: { database: state === 1 ? 'connected' : 'not_connected' },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
