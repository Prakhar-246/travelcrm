const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
  title:        { type: String, required: [true, 'Title required'], trim: true },
  destinations: [{ type: String }],
  nights:       { type: Number, required: true },
  days:         { type: Number, required: true },
  dayWise: [{
    dayNumber: { type: Number, required: true },
    date:      { type: String, trim: true },
    title:     { type: String, required: true, trim: true },
    content:   { type: String, required: true },
    activities:[{ type: String }],
    meals:     { breakfast: Boolean, lunch: Boolean, dinner: Boolean },
    hotel:     String,
    transport: String,
  }],
  inclusions:    [{ type: String }],
  exclusions:    [{ type: String }],
  notes:         { type: String },
  isTemplate:    { type: Boolean, default: false },
  templateName:  { type: String },
  costPerPerson: { type: Number, default: 0 },
  totalPax:      { type: Number, default: 1 },
  booking:       { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', ItinerarySchema);
