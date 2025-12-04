const mongoose = require('mongoose');

const UPLOAD_STATUS = ['received', 'validated', 'parsed', 'error'];

const UploadSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  original_name: { type: String, required: true },
  content_type: { type: String },
  size_bytes: { type: Number, min: 0 },
  storage_path: { type: String, required: true },
  status: { type: String, enum: UPLOAD_STATUS, required: true, default: 'received', index: true },
  error_message: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false, collection: 'uploads' });

module.exports = mongoose.models.Upload || mongoose.model('Upload', UploadSchema);
