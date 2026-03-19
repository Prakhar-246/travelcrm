const Itinerary = require('../models/Itinerary');

exports.getItineraries = async (req, res, next) => {
  try {
    const { isTemplate, search } = req.query;
    const query = {};
    if (isTemplate !== undefined) query.isTemplate = isTemplate === 'true';
    if (search) query.$or = [
      { title:        { $regex: search, $options: 'i' } },
      { destinations: { $regex: search, $options: 'i' } },
    ];
    const itineraries = await Itinerary.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: itineraries.length, data: itineraries });
  } catch (err) { next(err); }
};

exports.getItinerary = async (req, res, next) => {
  try {
    const itin = await Itinerary.findById(req.params.id).populate('createdBy', 'name');
    if (!itin) return res.status(404).json({ success: false, error: 'Itinerary not found' });
    res.json({ success: true, data: itin });
  } catch (err) { next(err); }
};

exports.createItinerary = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const itin = await Itinerary.create(req.body);
    res.status(201).json({ success: true, data: itin });
  } catch (err) { next(err); }
};

exports.updateItinerary = async (req, res, next) => {
  try {
    const itin = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!itin) return res.status(404).json({ success: false, error: 'Itinerary not found' });
    res.json({ success: true, data: itin });
  } catch (err) { next(err); }
};

exports.deleteItinerary = async (req, res, next) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};

exports.duplicateItinerary = async (req, res, next) => {
  try {
    const original = await Itinerary.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ success: false, error: 'Itinerary not found' });
    delete original._id;
    original.title      = original.title + ' (Copy)';
    original.createdBy  = req.user.id;
    original.booking    = undefined;
    const copy = await Itinerary.create(original);
    res.status(201).json({ success: true, data: copy });
  } catch (err) { next(err); }
};

exports.generateWhatsApp = async (req, res, next) => {
  try {
    const itin = await Itinerary.findById(req.params.id);
    if (!itin) return res.status(404).json({ success: false, error: 'Itinerary not found' });

    const lines = [
      `━━━━━━━━━━━━━━━━━━━━`,
      `🏔 *${itin.title.toUpperCase()}*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `📅 *Duration:* ${itin.nights}N / ${itin.days}D`,
      `👥 *PAX:* ${itin.totalPax}`,
      `💰 *Per Person:* ₹${itin.costPerPerson.toLocaleString('en-IN')}`,
      `💰 *Total:* ₹${(itin.costPerPerson * itin.totalPax).toLocaleString('en-IN')}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📅 *TOUR ITINERARY*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ``,
      ...itin.dayWise.flatMap(d => [
        `*Day ${d.dayNumber}${d.date ? ' — ' + d.date : ''}*`,
        `🔹 *${d.title}*`,
        d.content,
        ``,
      ]),
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ *INCLUSIONS*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ...itin.inclusions.map(i => `✓ ${i}`),
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `❌ *EXCLUSIONS*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ...itin.exclusions.map(e => `✗ ${e}`),
      ``,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📞 *TravelandHolidays.in*`,
      `📱 +91-7000739379`,
      `🌐 www.travelandholidays.in`,
      `━━━━━━━━━━━━━━━━━━━━`,
    ];

    res.json({ success: true, data: { text: lines.join('\n') } });
  } catch (err) { next(err); }
};
