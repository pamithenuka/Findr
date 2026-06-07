const express = require('express');
const router = express.Router();
const { getAllUsers, getAllItemsForAdmin, makeUserAdmin } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getAllUsers);
router.get('/items', protect, admin, getAllItemsForAdmin);
router.put('/users/:id/promote', protect, admin, makeUserAdmin);

module.exports = router;
