const mongoose = require('mongoose');

const USER_ROLES = ['admin', 'analyst', 'viewer'];

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  full_name: { type: String, default: '' },
  role: { type: String, enum: USER_ROLES, default: 'analyst', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, versionKey: false });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
