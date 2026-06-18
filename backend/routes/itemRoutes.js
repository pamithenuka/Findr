const express = require('express');
const router = express.Router();
const { createItem, getAllItems, getUserItems, resolveItem, deleteItem, getItemById, updateItem } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', getAllItems);
router.get('/dashboard', protect, getUserItems);
router.get('/:id', getItemById);

router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.put('/:id/resolve', protect, resolveItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;