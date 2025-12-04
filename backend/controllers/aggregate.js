const DatasetField = require('../models/datasetField');
const DatasetRecord = require('../models/datasetRecord');

function buildMatch(filters = {}) {
  const m = {};
  for (const [field, value] of Object.entries(filters)) {
    if (value == null) continue;
    const key = `row_data.${field}`;
    if (Array.isArray(value)) m[key] = { $in: value };
    else m[key] = value;
  }
  return m;
}

function bucketExpr(field, timeBucket) {
  const dateExpr = { $toDate: `$row_data.${field}` };
  switch (timeBucket) {
    case 'day': return { $dateToString: { date: dateExpr, format: '%Y-%m-%d' } };
    case 'month': return { $dateToString: { date: dateExpr, format: '%Y-%m' } };
    case 'year': return { $dateToString: { date: dateExpr, format: '%Y' } };
    default: return dateExpr;
  }
}

exports.aggregate = async (req, res, next) => {
  try {
    const { datasetId, measures = [], dimensions = [], filters = {}, timeBucket, timeField } = req.body || {};
    if (!datasetId) return res.status(400).json({ message: 'datasetId is required' });

    const fields = await DatasetField.find({ dataset_id: datasetId }).lean();
    const fieldMap = new Map(fields.map(f => [f.field_name, f]));

    const groupId = {};
    for (const dim of dimensions) {
      const f = fieldMap.get(dim);
      if (!f) return res.status(400).json({ message: `Unknown dimension field ${dim}` });
      if (f.inferred_type === 'temporal' && (timeBucket || timeField === dim)) {
        groupId[dim] = bucketExpr(dim, timeBucket || 'day');
      } else {
        groupId[dim] = `$row_data.${dim}`;
      }
    }

    const groupStage = { _id: groupId };
    for (const m of measures) {
      const f = fieldMap.get(m.field);
      if (!f) return res.status(400).json({ message: `Unknown measure field ${m.field}` });
      const expr = { $toDouble: `$row_data.${m.field}` };
      const key = `${m.agg || 'sum'}_${m.field}`;
      switch ((m.agg || 'sum')) {
        case 'sum': groupStage[key] = { $sum: expr }; break;
        case 'avg': groupStage[key] = { $avg: expr }; break;
        case 'min': groupStage[key] = { $min: expr }; break;
        case 'max': groupStage[key] = { $max: expr }; break;
        case 'count': groupStage[key] = { $sum: 1 }; break;
        default: return res.status(400).json({ message: `Unsupported agg ${m.agg}` });
      }
    }

    const pipeline = [
      { $match: { dataset_id: require('mongoose').Types.ObjectId.createFromHexString(String(datasetId)), ...buildMatch(filters) } },
      { $group: groupStage },
      { $sort: { ...(dimensions.reduce((a,d)=> (a[`_id.${d}`]=1,a), {})) } },
    ];

    const rows = await DatasetRecord.aggregate(pipeline);
    const result = rows.map(r => ({ ...r._id, ...Object.fromEntries(Object.entries(r).filter(([k])=>k!=='_id')) }));
    res.json({ rows: result });
  } catch (e) { next(e); }
};
