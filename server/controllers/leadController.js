const Lead = require('../models/Lead');

exports.getLeads = async (req, res, next) => {
  try {
    const { status, source, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { phone:       { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }
    if (req.user.role === 'sales') query.assignedTo = req.user.id;

    const total  = await Lead.countDocuments(query);
    const leads  = await Lead.find(query)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, count: leads.length, total, data: leads });
  } catch (err) { next(err); }
};

exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('bookingRef');
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.createLead = async (req, res, next) => {
  try {
    req.body.createdBy  = req.user.id;
    if (!req.body.assignedTo) req.body.assignedTo = req.user.id;
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.addNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    lead.notes.push({ text: req.body.text, addedBy: req.user.id });
    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.addReminder = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });
    lead.reminders.push({ ...req.body, createdBy: req.user.id });
    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

exports.getPipeline = async (req, res, next) => {
  try {
    const statuses = ['new', 'contacted', 'proposal', 'negotiation', 'booked', 'lost'];
    const pipeline = await Promise.all(statuses.map(async s => {
      const leads = await Lead.find({ status: s })
        .select('name phone destination budget pax travelDates')
        .sort({ updatedAt: -1 });
      return { status: s, count: leads.length, leads };
    }));
    res.json({ success: true, data: pipeline });
  } catch (err) { next(err); }
};
