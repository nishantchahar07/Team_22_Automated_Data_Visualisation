const { connectMongo } = require('../db/db');

const User = require('./user');
const Upload = require('./upload');
const Dataset = require('./dataset');
const DatasetField = require('./datasetField');
const DatasetRecord = require('./datasetRecord');
const Dashboard = require('./dashboard');
const Chart = require('./chart');
const Filter = require('./filter');
const ChartFilter = require('./chartFilter');
const CachedAggregate = require('./cachedAggregate');
const ProcessingJob = require('./processingJob');

async function initMongo() {
  await connectMongo();
  return {
    User,
    Upload,
    Dataset,
    DatasetField,
    DatasetRecord,
    Dashboard,
    Chart,
    Filter,
    ChartFilter,
    CachedAggregate,
    ProcessingJob,
  };
}

module.exports = {
  initMongo,
  User,
  Upload,
  Dataset,
  DatasetField,
  DatasetRecord,
  Dashboard,
  Chart,
  Filter,
  ChartFilter,
  CachedAggregate,
  ProcessingJob,
};
