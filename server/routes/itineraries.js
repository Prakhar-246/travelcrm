const router = require('express').Router();
const { getItineraries, getItinerary, createItinerary, updateItinerary, deleteItinerary, duplicateItinerary, generateWhatsApp } = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getItineraries).post(createItinerary);
router.route('/:id').get(getItinerary).put(updateItinerary).delete(deleteItinerary);
router.post('/:id/duplicate',  duplicateItinerary);
router.get('/:id/whatsapp',    generateWhatsApp);
module.exports = router;
