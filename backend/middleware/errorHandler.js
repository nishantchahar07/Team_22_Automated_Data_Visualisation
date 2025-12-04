module.exports = function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const payload = { status, message };
  if (process.env.NODE_ENV !== 'production' && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
};
