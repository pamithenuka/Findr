const express = require('express');
const router = express.Router();
const { createItem, getAllItems, getUserItems, resolveItem, deleteItem, getItemById } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllItems);
router.get('/:id', getItemById);

router.post('/', protect, createItem);
router.get('/dashboard', protect, getUserItems);
router.put('/:id/resolve', protect, resolveItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;