const ChartFilter = require('../models/chartFilter');

exports.byChart = async (req, res, next) => {
  try {
    const { chartId } = req.params;
    const items = await ChartFilter.find({ chart_id: chartId }).lean();
    res.json(items);
  } catch (e) { next(e); }
};
