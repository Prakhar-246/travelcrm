const Booking = require('../models/Booking');
const Vendor  = require('../models/Vendor');

exports.getSummary = async (req, res, next) => {
  try {
    const bookings = await Booking.find({});
    const totalRevenue  = bookings.reduce((s, b) => s + b.totalCost, 0);
    const totalCollected= bookings.reduce((s, b) => s + b.payments.reduce((p, pay) => p + pay.amount, 0), 0);
    const totalPending  = totalRevenue - totalCollected;

    const vendors       = await Vendor.find({ isActive: true });
    const totalVendorDues = vendors.reduce((s, v) => s + v.outstanding, 0);

    const upcoming = await Booking.find({ status: 'upcoming' }).select('customer destination startDate totalCost payments');
    const paymentDue = upcoming.map(b => ({
      bookingId:   b.bookingId,
      customer:    b.customer.name,
      destination: b.destination,
      startDate:   b.startDate,
      totalCost:   b.totalCost,
      paid:        b.payments.reduce((s, p) => s + p.amount, 0),
      pending:     b.totalCost - b.payments.reduce((s, p) => s + p.amount, 0),
    })).filter(b => b.pending > 0);

    res.json({
      success: true,
      data: { totalRevenue, totalCollected, totalPending, totalVendorDues, paymentDue },
    });
  } catch (err) { next(err); }
};

exports.getCustomerPayments = async (req, res, next) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    const data = bookings.map(b => ({
      _id:         b._id,
      bookingId:   b.bookingId,
      customer:    b.customer,
      destination: b.destination,
      totalCost:   b.totalCost,
      payments:    b.payments,
      amountPaid:  b.payments.reduce((s, p) => s + p.amount, 0),
      amountPending: b.totalCost - b.payments.reduce((s, p) => s + p.amount, 0),
      status:      b.status,
    }));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getVendorDues = async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ isActive: true }).sort({ outstanding: -1 });
    res.json({ success: true, data: vendors });
  } catch (err) { next(err); }
};

exports.getProfitReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year || new Date().getFullYear(), (month ? month - 1 : 0), 1);
    const end   = month
      ? new Date(year || new Date().getFullYear(), month, 0, 23, 59, 59)
      : new Date(year || new Date().getFullYear(), 11, 31, 23, 59, 59);

    const bookings = await Booking.find({ createdAt: { $gte: start, $lte: end } });
    const revenue  = bookings.reduce((s, b) => s + b.totalCost, 0);
    const collected= bookings.reduce((s, b) => s + b.payments.reduce((p, pay) => p + pay.amount, 0), 0);

    const vendors  = await Vendor.find({ isActive: true });
    const vendorCost = vendors.reduce((s, v) => s + v.totalPaid, 0);
    const profit   = collected - vendorCost;

    res.json({
      success: true,
      data: {
        period: { start, end },
        totalBookings: bookings.length,
        revenue, collected,
        vendorCost, profit,
        margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : 0,
      },
    });
  } catch (err) { next(err); }
};
