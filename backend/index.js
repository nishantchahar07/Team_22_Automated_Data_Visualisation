

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectMongo } = require('./db/db');
const statusRoutes = require('./routes/status');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5001',
    ];
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV === 'production') return callback(new Error('Not allowed by CORS policy'));
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

const statusColor = (code) => {
  if (code >= 500) return '\x1b[31m';
  if (code >= 400) return '\x1b[33m';
  return '\x1b[32m';
};

morgan.format('colored', (tokens, req, res) => {
  const status = tokens.status(req, res);
  const color = statusColor(Number(status));
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const time = tokens['response-time'](req, res);
  const length = tokens.res(req, res, 'content-length') || '-';
  return `${method} ${url} ${color}${status}\x1b[0m ${time} ms - ${length}`;
});

app.use(morgan('colored'));

app.use('/', statusRoutes);
app.use('/', require('./routes/upload'));
app.use('/', require('./routes/datasets'));
app.use('/', require('./routes/dashboards'));
app.use('/', require('./routes/charts'));
app.use('/', require('./routes/filters'));
app.use('/', require('./routes/chartFilters'));
app.use('/', require('./routes/uploads'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/aggregate'));

app.use((req, res) => res.status(404).json({ status: 404, message: 'API route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const hasMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_HOST;
    if (!hasMongoUri) {
      logger.error('Missing Mongo connection configuration (MONGODB_URI or MONGO_URI or MONGO_HOST)');
      process.exit(1);
    }

    await connectMongo();

    const server = app.listen(PORT, () => logger.success(`Server listening on http://localhost:${PORT}`));

    const shutdown = async (signal) => {
      logger.warn(`${signal} received. Shutting down...`);
      server.close(async () => {
        try {
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          logger.info('Mongo connection closed');
        } catch (e) {
          logger.error('Error during shutdown:', e);
        } finally {
          process.exit(0);
        }
      });
      setTimeout(() => process.exit(1), 10000).unref();
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    logger.error('Failed to start server:', error.message || error);
    process.exit(1);
  }
}

startServer();
