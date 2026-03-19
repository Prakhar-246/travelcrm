const Booking = require('../models/Booking');
const Lead    = require('../models/Lead');

exports.getBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { 'customer.name':  { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { destination:      { $regex: search, $options: 'i' } },
        { bookingId:        { $regex: search, $options: 'i' } },
      ];
    }
    const total    = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('itinerary', 'title nights days')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: bookings.length, total, data: bookings });
  } catch (err) { next(err); }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('itinerary')
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.createBooking = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const booking = await Booking.create(req.body);
    if (req.body.lead) {
      await Lead.findByIdAndUpdate(req.body.lead, {
        status: 'booked', convertedToBooking: true, bookingRef: booking._id,
      });
    }
    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.addPayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    booking.payments.push({ ...req.body, receivedBy: req.user.id });
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

exports.addCustomRequirement = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    booking.customRequirements.push(req.body);
    await booking.save();
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
