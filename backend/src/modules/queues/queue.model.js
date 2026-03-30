const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, unique: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  currentCount: { type: Number, default: 0, min: 0 },
  totalServedToday: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'closed', 'paused'], default: 'closed' },
  lastResetDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

queueSchema.methods.getEstimatedWait = function (avgServiceTime) {
  return this.currentCount * avgServiceTime;
};

queueSchema.index({ hospitalId: 1 });

module.exports = mongoose.model('Queue', queueSchema);
