const Dataset = require('../models/dataset');
const DatasetField = require('../models/datasetField');
const DatasetRecord = require('../models/datasetRecord');

exports.list = async (req, res, next) => {
  try {
    const items = await Dataset.find({}).sort({ created_at: -1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Dataset.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Dataset not found' });
    res.json(item);
  } catch (e) { next(e); }
};

exports.fields = async (req, res, next) => {
  try {
    const { id } = req.params;
    const items = await DatasetField.find({ dataset_id: id }).sort({ ordinal_position: 1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.records = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 1000);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      DatasetRecord.find({ dataset_id: id }).sort({ created_at: -1 }).skip(skip).limit(limit).lean(),
      DatasetRecord.countDocuments({ dataset_id: id })
    ]);
    res.json({ page, limit, total, items });
  } catch (e) { next(e); }
};
