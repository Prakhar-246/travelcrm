const Package = require('../models/Package');

exports.getPackages = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = { isActive: true };
    if (search) query.$or = [
      { name:         { $regex: search, $options: 'i' } },
      { destinations: { $regex: search, $options: 'i' } },
    ];
    const packages = await Package.find(query).populate('itineraryTemplate', 'title').sort({ createdAt: -1 });
    res.json({ success: true, count: packages.length, data: packages });
  } catch (err) { next(err); }
};

exports.getPackage = async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id).populate('itineraryTemplate');
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.createPackage = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const pkg = await Package.create(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.updatePackage = async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pkg) return res.status(404).json({ success: false, error: 'Package not found' });
    res.json({ success: true, data: pkg });
  } catch (err) { next(err); }
};

exports.deletePackage = async (req, res, next) => {
  try {
    await Package.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
