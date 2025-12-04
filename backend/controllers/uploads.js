const Upload = require('../models/upload');

exports.list = async (_req, res, next) => {
  try {
    const items = await Upload.find({}).sort({ created_at: -1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Upload.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Upload not found' });
    res.json(item);
  } catch (e) { next(e); }
};
