const express = require('express');
const router = express.Router();
const { createItem, getAllItems, getUserItems, resolveItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllItems);

router.post('/', protect, createItem);
router.get('/dashboard', protect, getUserItems);
router.put('/:id/resolve', protect, resolveItem);

module.exports = router;