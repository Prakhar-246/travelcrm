const mongoose = require('mongoose');

const TransportSchema = new mongoose.Schema({
  vendorName:      { type: String, required: true, trim: true },
  vehicleType:     { type: String, required: true, trim: true },
  vehicleNumber:   { type: String, trim: true },
  seatingCapacity: { type: Number },
  ratePerDay:      { type: Number, required: true },
  ratePerKm:       { type: Number },
  driver: {
    name:    { type: String, trim: true },
    phone:   { type: String, trim: true },
    license: { type: String, trim: true },
  },
  status:    { type: String, enum: ['available', 'assigned', 'maintenance'], default: 'available' },
  assignedTo:{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  notes:     { type: String },
  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Transport', TransportSchema);
