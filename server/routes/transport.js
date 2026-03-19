const router = require('express').Router();
const { getTransports, getTransport, createTransport, updateTransport, deleteTransport, assignTransport } = require('../controllers/transportController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getTransports).post(createTransport);
router.route('/:id').get(getTransport).put(updateTransport).delete(authorize('admin'), deleteTransport);
router.put('/:id/assign', assignTransport);
module.exports = router;
