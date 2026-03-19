const Hotel = require('../models/Hotel');

exports.getHotels = async (req, res, next) => {
  try {
    const { city, category, search } = req.query;
    const query = { isActive: true };
    if (city)     query.city     = { $regex: city,     $options: 'i' };
    if (category) query.category = category;
    if (search)   query.$or = [
      { name:     { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { city:     { $regex: search, $options: 'i' } },
    ];
    const hotels = await Hotel.find(query).sort({ city: 1, name: 1 });
    res.json({ success: true, count: hotels.length, data: hotels });
  } catch (err) { next(err); }
};

exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ success: false, error: 'Hotel not found' });
    res.json({ success: true, data: hotel });
  } catch (err) { next(err); }
};

exports.createHotel = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) { next(err); }
};

exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hotel) return res.status(404).json({ success: false, error: 'Hotel not found' });
    res.json({ success: true, data: hotel });
  } catch (err) { next(err); }
};

exports.deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, data: {} });
  } catch (err) { next(err); }
};
