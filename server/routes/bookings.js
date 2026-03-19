const router = require('express').Router();
const {
  getBookings, getBooking, createBooking, updateBooking, deleteBooking,
  addPayment, updateStatus, addCustomRequirement,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBookings)
  .post(createBooking);
router.route('/:id')
  .get(getBooking)
  .put(updateBooking)
  .delete(authorize('admin'), deleteBooking);
router.post('/:id/payments',           addPayment);
router.put('/:id/status',              updateStatus);
router.post('/:id/custom-requirements',addCustomRequirement);

module.exports = router;
