const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name:          { type: String, required: [true, 'Vendor name required'], trim: true },
  type:          { type: String, enum: ['Hotel', 'Transport', 'Activity', 'Catering', 'Guide', 'Other'], required: true },
  contactPerson: { type: String, trim: true },
  phone:         { type: String, trim: true },
  email:         { type: String, trim: true, lowercase: true },
  address:       { type: String },
  bankDetails: {
    accountName:   String,
    accountNumber: String,
    ifscCode:      String,
    bankName:      String,
    upiId:         String,
  },
  rating:        { type: Number, min: 1, max: 5, default: 3 },
  totalBusiness: { type: Number, default: 0 },
  totalPaid:     { type: Number, default: 0 },
  outstanding:   { type: Number, default: 0 },
  paymentHistory: [{
    amount:     { type: Number, required: true },
    date:       { type: Date, default: Date.now },
    method:     { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque'], default: 'upi' },
    bookingRef: String,
    note:       String,
  }],
  notes:    { type: String },
  isActive: { type: Boolean, default: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);
