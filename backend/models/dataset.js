const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
  upload_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', unique: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  row_count: { type: Number, min: 0 },
  column_count: { type: Number, min: 0 },
  schema_version: { type: String, default: 'v1' },
  inferred_at: { type: Date },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'datasets' });

module.exports = mongoose.models.Dataset || mongoose.model('Dataset', DatasetSchema);
