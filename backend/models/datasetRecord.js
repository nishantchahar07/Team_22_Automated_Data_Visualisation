const mongoose = require('mongoose');

const DatasetRecordSchema = new mongoose.Schema({
  dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  row_data: { type: Object, required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false, collection: 'dataset_records' });

module.exports = mongoose.models.DatasetRecord || mongoose.model('DatasetRecord', DatasetRecordSchema);
