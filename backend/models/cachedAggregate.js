const mongoose = require('mongoose');

const CachedAggregateSchema = new mongoose.Schema({
  dataset_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true, index: true },
  cache_key: { type: String, required: true },
  result: { type: Object, required: true },
  computed_at: { type: Date, default: () => new Date(), required: true },
  ttl_seconds: { type: Number, default: 600, required: true },
}, { timestamps: false, versionKey: false, collection: 'cached_aggregates' });

CachedAggregateSchema.index({ dataset_id: 1, cache_key: 1 }, { unique: true });

module.exports = mongoose.models.CachedAggregate || mongoose.model('CachedAggregate', CachedAggregateSchema);
