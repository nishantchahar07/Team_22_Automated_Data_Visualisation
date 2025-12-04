const mongoose = require('mongoose');

const CHART_TYPES = ['bar', 'column', 'line', 'area', 'pie', 'donut', 'scatter'];
const AGG_FN = ['sum', 'avg', 'count', 'min', 'max'];

const ChartSchema = new mongoose.Schema({
  dashboard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dashboard', required: true, index: true },
  title: { type: String, required: true },
  chart_type: { type: String, enum: CHART_TYPES, required: true },
  x_field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DatasetField' },
  y_field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DatasetField' },
  group_by_field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DatasetField' },
  aggregation: { type: String, enum: AGG_FN },
  options: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'charts' });

module.exports = mongoose.models.Chart || mongoose.model('Chart', ChartSchema);
