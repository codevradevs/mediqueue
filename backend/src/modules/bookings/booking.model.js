const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  scheduledTime: { type: Date, required: true },
  queueNumber: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
  },
  notes: { type: String },
  symptoms: { type: String },
  cancelledAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ hospitalId: 1, scheduledTime: 1 });
bookingSchema.index({ departmentId: 1, scheduledTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
