const User = require('../models/user');

exports.list = async (_req, res, next) => {
  try {
    const items = await User.find({}).sort({ created_at: -1 }).lean();
    res.json(items);
  } catch (e) { next(e); }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await User.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'User not found' });
    res.json(item);
  } catch (e) { next(e); }
};
