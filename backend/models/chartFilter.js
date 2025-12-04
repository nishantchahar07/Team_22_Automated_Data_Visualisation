const mongoose = require('mongoose');

const INCLUDE_MODE = ['include', 'exclude'];

const ChartFilterSchema = new mongoose.Schema({
  chart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chart', required: true },
  filter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Filter', required: true },
  mode: { type: String, enum: INCLUDE_MODE, default: 'include', required: true },
}, { timestamps: false, versionKey: false, collection: 'chart_filters' });

ChartFilterSchema.index({ chart_id: 1, filter_id: 1 }, { unique: true });

module.exports = mongoose.models.ChartFilter || mongoose.model('ChartFilter', ChartFilterSchema);
