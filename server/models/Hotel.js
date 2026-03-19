const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name:       { type: String, required: [true, 'Hotel name required'], trim: true },
  location:   { type: String, required: [true, 'Location required'], trim: true },
  city:       { type: String, trim: true },
  state:      { type: String, trim: true },
  category:   { type: String, enum: ['Budget', '1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], default: '3 Star' },
  starRating: { type: Number, min: 1, max: 5, default: 3 },
  roomTypes:  [{ type: String }],
  mealPlans:  [{ type: String, enum: ['EP', 'CP', 'MAP', 'AP'] }],
  // Rates
  cpRate:   { type: Number, default: 0 },
  mapRate:  { type: Number, default: 0 },
  apRate:   { type: Number, default: 0 },
  epRate:   { type: Number, default: 0 },
  peakRate: { type: Number, default: 0 },
  seasonPrices: [{
    seasonName: String,
    startDate:  Date,
    endDate:    Date,
    cpRate:     Number,
    mapRate:    Number,
    apRate:     Number,
  }],
  blackoutDates: [{ startDate: Date, endDate: Date, reason: String }],
  contactPerson: { name: String, phone: String, email: String },
  amenities: [{ type: String }],
  notes:     { type: String },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

HotelSchema.index({ city: 1, isActive: 1 });

module.exports = mongoose.model('Hotel', HotelSchema);
