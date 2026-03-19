const Transport = require('../models/Transport');

exports.getTransports = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = { isActive: true };
    if (status) query.status = status;
    if (search) query.$or = [
      { vendorName:  { $regex: search, $options: 'i' } },
      { vehicleType: { $regex: search, $options: 'i' } },
    ];
    const transports = await Transport.find(query).sort({ vendorName: 1 });
    res.json({ success: true, count: transports.length, data: transports });
  } catch (err) { next(err); }
};

exports.getTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    res.json({ success: true, data: transport });
  } catch (err) { next(err); }
};

exports.createTransport = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const transport = await Transport.create(req.body);
    res.status(201).json({ success: true, data: transport });
  } catch (err) { next(err); }
};

exports.updateTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!transport) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    res.json({ success: true, data: transport });
  } catch (err) { next(err); }
};

exports.deleteTransport = async (req, res, next) => {
  try {
    await Transport.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.assignTransport = async (req, res, next) => {
  try {
    const transport = await Transport.findByIdAndUpdate(
      req.params.id,
      { status: 'assigned', assignedTo: req.body.bookingId },
      { new: true }
    );
    if (!transport) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    res.json({ success: true, data: transport });
  } catch (err) { next(err); }
};
