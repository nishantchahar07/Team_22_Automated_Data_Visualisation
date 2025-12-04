const Filter = require('../models/filter');

exports.byDashboard = async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const items = await Filter.find({ dashboard_id: dashboardId }).lean();
    res.json(items);
  } catch (e) { next(e); }
};
