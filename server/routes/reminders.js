const router = require('express').Router();
const { getReminders, createReminder, updateReminder, markDone, deleteReminder } = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getReminders).post(createReminder);
router.route('/:id').put(updateReminder).delete(deleteReminder);
router.put('/:id/done', markDone);
module.exports = router;
