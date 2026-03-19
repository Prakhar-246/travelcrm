const router = require('express').Router();
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor, addPayment } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getVendors).post(createVendor);
router.route('/:id').get(getVendor).put(updateVendor).delete(authorize('admin'), deleteVendor);
router.post('/:id/payments', addPayment);
module.exports = router;
