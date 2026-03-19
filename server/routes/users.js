const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser, toggleActive } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
router.use(protect, authorize('admin'));
router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser);
router.put('/:id/toggle', toggleActive);
module.exports = router;
