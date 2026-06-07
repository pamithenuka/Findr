const User = require('../models/User');
const Item = require('../models/Item');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};

exports.getAllItemsForAdmin = async (req, res) => {
    try {
        // Fetch all items, regardless of isResolved status
        const items = await Item.find({})
            .populate('postedBy', 'name email')
            .sort({ createdAt: -1 });
            
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all items', error: error.message });
    }
};

exports.makeUserAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.role = 'admin';
        await user.save();
        
        res.json({ message: 'User elevated to admin successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error elevating user', error: error.message });
    }
};
