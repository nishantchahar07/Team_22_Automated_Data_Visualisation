const mongoose = require('mongoose');

const DATA_TYPES = ['categorical', 'numerical', 'temporal'];

const DatasetFieldSchema = new mongoose.Schema({
  dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  ordinal_position: { type: Number, required: true, min: 0 },
  field_name: { type: String, required: true },
  display_name: { type: String },
  inferred_type: { type: String, enum: DATA_TYPES, required: true },
  is_nullable: { type: Boolean, default: true },
  distinct_count: { type: Number },
  sample_rate: { type: Number, min: 0, max: 1 },
  min_value: { type: String },
  max_value: { type: String },
  top_values: { type: Array },
  metadata: { type: Object },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'dataset_fields' });

DatasetFieldSchema.index({ dataset_id: 1, field_name: 1 }, { unique: true });

module.exports = mongoose.models.DatasetField || mongoose.model('DatasetField', DatasetFieldSchema);
