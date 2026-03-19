const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  lead:      { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  customer: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    email:   { type: String },
    address: { type: String },
    idProof: { type: String },
  },
  destination: { type: String, required: true },
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  pax:         { type: Number, required: true, min: 1 },
  itinerary:   { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  hotels: [{
    hotelId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    hotelName:     String,
    location:      String,
    checkIn:       Date,
    checkOut:      Date,
    roomType:      String,
    mealPlan:      String,
    rooms:         { type: Number, default: 1 },
    ratePerRoom:   Number,
    totalCost:     Number,
    confirmed:     { type: Boolean, default: false },
    confirmationNo:String,
  }],
  transport: [{
    vehicleId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Transport' },
    vendorName:  String,
    vehicleType: String,
    driverName:  String,
    driverPhone: String,
    days:        Number,
    ratePerDay:  Number,
    totalCost:   Number,
    confirmed:   { type: Boolean, default: false },
  }],
  customRequirements: [{
    title:   { type: String, required: true },
    details: String,
    vendor:  String,
    cost:    { type: Number, default: 0 },
    status:  { type: String, enum: ['pending', 'arranged', 'done'], default: 'pending' },
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  totalCost: { type: Number, required: true },
  payments: [{
    amount:     { type: Number, required: true },
    date:       { type: Date, default: Date.now },
    method:     { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque'], default: 'upi' },
    note:       String,
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  vendorPayments: [{
    vendorName: String,
    amount:     Number,
    paid:       { type: Boolean, default: false },
    paidOn:     Date,
    note:       String,
  }],
  notes:      { type: String },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `B${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

BookingSchema.virtual('amountPaid').get(function () {
  return this.payments.reduce((s, p) => s + p.amount, 0);
});
BookingSchema.virtual('amountPending').get(function () {
  return this.totalCost - this.payments.reduce((s, p) => s + p.amount, 0);
});
BookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema);
