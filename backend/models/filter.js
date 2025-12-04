const mongoose = require('mongoose');

const FILTER_TYPES = ['value', 'range', 'date_range', 'search'];

const FilterSchema = new mongoose.Schema({
  dashboard_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dashboard', required: true, index: true },
  field_id: { type: mongoose.Schema.Types.ObjectId, ref: 'DatasetField', required: true },
  filter_type: { type: String, enum: FILTER_TYPES, required: true },
  config: { type: Object },
  default_value: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'filters' });

FilterSchema.index({ dashboard_id: 1, field_id: 1 }, { unique: true });

module.exports = mongoose.models.Filter || mongoose.model('Filter', FilterSchema);
