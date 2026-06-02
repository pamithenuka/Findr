const Item = require('../models/Item');

exports.createItem = async (req, res) => {
    try{
        const { title, description, category, status, location, imageUrl} = req.body;

        if(!title || !description || !category || !status || !location) {
            return res.status(400).json({ message: 'PLease fill in all required fields' });
        }

        const item = await Item.create({
            title,
            description,
            category,
            status,
            location,
            imageUrl: imageUrl || '',
            postedBy: req.user._id
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating item post', error: error.message });
    }
};



exports.getAllItems = async (req, res) => {
    try{

        const items = await Item.find({ isResolved: false})
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email phoneNumber');

            res.json(items);
    }catch (error) {
        res.status(500).json({ message: 'Server error fetching items', error: error.message });
    }
};



exports.getUserItems = async (req, res) => {
    try{
        const items = await Item.find({ postedBy: req.user._id}).sort({ createdAt: -1 });

        res.json(items);
    }catch (error) {
        res.status(500).json({ message: 'Server error fetching user items', error: error.message });
    }
};



exports.resolveItem = async (req, res) => {
    try{
        const item = await Item.findById(req.id || req.params.id);

        if(!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if(item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to update this item status'});
        }

        item.isResolved = true;
        await item.save();

        res.json({ message: 'Item marked as resolved!', item});
    } catch (error) {
        res.status(500).json({ message: 'Server error resolving item', error: error.message });
    }
};

