const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name:          { type: String, required: [true, 'Package name required'], trim: true },
  destinations:  [{ type: String }],
  nights:        { type: Number, required: true },
  days:          { type: Number, required: true },
  inclusions:    [{ type: String }],
  exclusions:    [{ type: String }],
  costPerPerson: { type: Number, required: true },
  hotels: [{
    location:  String,
    hotelName: String,
    roomType:  String,
    mealPlan:  String,
  }],
  highlights: [{ type: String }],
  itineraryTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Package', PackageSchema);
