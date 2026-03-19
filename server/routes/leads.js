const router = require('express').Router();
const {
  getLeads, getLead, createLead, updateLead, deleteLead,
  addNote, addReminder, getPipeline,
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/pipeline', getPipeline);
router.route('/')
  .get(getLeads)
  .post(createLead);
router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(authorize('admin'), deleteLead);
router.post('/:id/notes',     addNote);
router.post('/:id/reminders', addReminder);

module.exports = router;
