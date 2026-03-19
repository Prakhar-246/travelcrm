const router = require('express').Router();
const { getDashboardStats, getLeadReport, getBookingReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/leads',     getLeadReport);
router.get('/bookings',  getBookingReport);
module.exports = router;
