const Dashboard = require('../models/dashboard');
const Chart = require('../models/chart');

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Dashboard.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Dashboard not found' });
    res.json(item);
  } catch (e) { next(e); }
};

exports.byDataset = async (req, res, next) => {
  try {
    const { datasetId } = req.params;
    const items = await Dashboard.find({ dataset_id: datasetId }).sort({ created_at: -1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.charts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const items = await Chart.find({ dashboard_id: id }).lean();
    res.json(items);
  } catch (e) { next(e); }
};
