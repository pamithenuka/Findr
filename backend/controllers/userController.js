const User = require('../models/User');
const Item = require('../models/Item');

exports.getUserProfile = async (req, res) => {
    try {
        // req.user is already hydrated by the protect middleware
        const user = req.user;
        
        // Also fetch user's item statistics
        const items = await Item.find({ postedBy: user._id });
        const lostCount = items.filter(item => item.status === 'lost').length;
        const foundCount = items.filter(item => item.status === 'found').length;
        
        res.json({
            user,
            stats: {
                totalPosts: items.length,
                lostCount,
                foundCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};
