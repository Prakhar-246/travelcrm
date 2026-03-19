const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const query = { isActive: true };
    if (type)   query.type = type;
    if (search) query.$or  = [
      { name:          { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];
    const vendors = await Vendor.find(query).sort({ name: 1 });
    res.json({ success: true, count: vendors.length, data: vendors });
  } catch (err) { next(err); }
};

exports.getVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.createVendor = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const vendor = await Vendor.create(req.body);
    res.status(201).json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.updateVendor = async (req, res, next) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.addPayment = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ success: false, error: 'Vendor not found' });
    vendor.paymentHistory.push(req.body);
    vendor.totalPaid   += req.body.amount;
    vendor.outstanding  = Math.max(0, vendor.outstanding - req.body.amount);
    await vendor.save();
    res.json({ success: true, data: vendor });
  } catch (err) { next(err); }
};
