const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  avgServiceTime: { type: Number, default: 15, min: 1 }, // minutes per patient
  maxCapacity: { type: Number, default: 50 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

departmentSchema.index({ hospitalId: 1 });

module.exports = mongoose.model('Department', departmentSchema);
