// hotels.js
const hotelRouter = require('express').Router();
const { getHotels, getHotel, createHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/auth');
hotelRouter.use(protect);
hotelRouter.route('/').get(getHotels).post(createHotel);
hotelRouter.route('/:id').get(getHotel).put(updateHotel).delete(authorize('admin'), deleteHotel);
module.exports = hotelRouter;
