const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Name required'], trim: true },
  phone:       { type: String, required: [true, 'Phone required'], trim: true },
  email:       { type: String, trim: true, lowercase: true },
  destination: { type: String, required: [true, 'Destination required'], trim: true },
  budget:      { type: Number, required: [true, 'Budget required'] },
  travelDates: { type: String, trim: true },
  pax:         { type: Number, default: 1 },
  status: {
    type: String,
    enum: ['new', 'contacted', 'proposal', 'negotiation', 'booked', 'lost'],
    default: 'new',
  },
  source: {
    type: String,
    enum: ['WhatsApp', 'Website', 'Instagram', 'Facebook', 'Referral', 'Direct', 'Other'],
    default: 'WhatsApp',
  },
  notes: [{
    text:    { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now },
  }],
  reminders: [{
    message:   { type: String, required: true },
    dueDate:   { type: Date, required: true },
    isDone:    { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  lostReason:         { type: String },
  convertedToBooking: { type: Boolean, default: false },
  bookingRef:         { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  assignedTo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ phone: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
