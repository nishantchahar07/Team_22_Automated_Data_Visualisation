const mongoose = require('mongoose');

const JOB_STATUS = ['queued', 'running', 'succeeded', 'failed'];

const ProcessingJobSchema = new mongoose.Schema({
  dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', index: true },
  job_type: { type: String, required: true },
  status: { type: String, enum: JOB_STATUS, default: 'queued', required: true, index: true },
  payload: { type: Object },
  result: { type: Object },
  error_message: { type: String },
  started_at: { type: Date },
  finished_at: { type: Date },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'processing_jobs' });

module.exports = mongoose.models.ProcessingJob || mongoose.model('ProcessingJob', ProcessingJobSchema);
