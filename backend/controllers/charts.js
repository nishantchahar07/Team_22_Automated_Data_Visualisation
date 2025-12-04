const Chart = require('../models/chart');

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Chart.findById(id).lean();
    if (!item) return res.status(404).json({ message: 'Chart not found' });
    res.json(item);
  } catch (e) { next(e); }
};
