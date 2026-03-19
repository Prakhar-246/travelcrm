const router = require('express').Router();
const { getSummary, getCustomerPayments, getVendorDues, getProfitReport } = require('../controllers/financeController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.get('/summary',           getSummary);
router.get('/customer-payments', getCustomerPayments);
router.get('/vendor-dues',       getVendorDues);
router.get('/profit',            authorize('admin'), getProfitReport);
module.exports = router;
