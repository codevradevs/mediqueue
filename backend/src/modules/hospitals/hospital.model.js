const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    county: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  contact: {
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String },
  },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

hospitalSchema.index({ 'location.county': 1 });
hospitalSchema.index({ name: 'text', 'location.city': 'text' });

module.exports = mongoose.model('Hospital', hospitalSchema);
