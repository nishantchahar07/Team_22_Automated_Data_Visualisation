const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  layout: { type: Object },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'dashboards' });

module.exports = mongoose.models.Dashboard || mongoose.model('Dashboard', DashboardSchema);
