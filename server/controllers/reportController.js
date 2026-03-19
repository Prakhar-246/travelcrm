const Lead    = require('../models/Lead');
const Booking = require('../models/Booking');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalLeads, newLeads, totalBookings,
      upcomingBookings, ongoingBookings,
    ] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ status: 'new' }),
      Booking.countDocuments({}),
      Booking.countDocuments({ status: 'upcoming' }),
      Booking.countDocuments({ status: 'ongoing' }),
    ]);

    const bookings  = await Booking.find({});
    const revenue   = bookings.reduce((s, b) => s + b.totalCost, 0);
    const collected = bookings.reduce((s, b) => s + b.payments.reduce((p, pay) => p + pay.amount, 0), 0);
    const pending   = revenue - collected;

    const bookedLeads    = await Lead.countDocuments({ status: 'booked' });
    const conversionRate = totalLeads > 0 ? ((bookedLeads / totalLeads) * 100).toFixed(1) : 0;

    const recentLeads    = await Lead.find({}).sort({ createdAt: -1 }).limit(5).select('name destination status createdAt');
    const recentBookings = await Booking.find({}).sort({ createdAt: -1 }).limit(5).select('bookingId customer destination status totalCost');

    res.json({
      success: true,
      data: {
        totalLeads, newLeads, totalBookings,
        upcomingBookings, ongoingBookings,
        revenue, collected, pending,
        conversionRate,
        recentLeads, recentBookings,
      },
    });
  } catch (err) { next(err); }
};

exports.getLeadReport = async (req, res, next) => {
  try {
    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);
    const byDestination = await Lead.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data: { byStatus, bySource, byDestination } });
  } catch (err) { next(err); }
};

exports.getBookingReport = async (req, res, next) => {
  try {
    const byStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalCost' } } },
    ]);
    const byDestination = await Booking.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 }, revenue: { $sum: '$totalCost' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
    const monthly = await Booking.aggregate([
      {
        $group: {
          _id:     { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count:   { $sum: 1 },
          revenue: { $sum: '$totalCost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    res.json({ success: true, data: { byStatus, byDestination, monthly } });
  } catch (err) { next(err); }
};
