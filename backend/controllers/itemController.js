const Item = require('../models/Item');

exports.createItem = async (req, res) => {
    try{
        const { title, description, category, status, location, dateLostFound } = req.body;

        if(!title || !description || !category || !status || !location) {
            return res.status(400).json({ message: 'Please fill in all required fields' });
        }

        // Check for uploaded file
        let finalImageUrl = req.body.imageUrl || '';
        if (req.file) {
            finalImageUrl = `/uploads/${req.file.filename}`;
        }

        const item = await Item.create({
            title,
            description,
            category,
            status,
            location,
            imageUrl: finalImageUrl,
            dateLostFound: dateLostFound || Date.now(),
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

exports.getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('postedBy', 'name email phoneNumber');
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching item', error: error.message });
    }
};




exports.getUserItems = async (req, res) => {
    try{
        const filter = { postedBy: req.user._id };
        
        // By default show all items; if showResolved=false, hide resolved ones
        if (req.query.showResolved === 'false') {
            filter.isResolved = false;
        }

        const items = await Item.find(filter).sort({ createdAt: -1 });

        res.json(items);
    }catch (error) {
        res.status(500).json({ message: 'Server error fetching user items', error: error.message });
    }
};



exports.resolveItem = async (req, res) => {
    try{
        const item = await Item.findById(req.params.id);

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



exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Only the owner or an admin can edit
        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to edit this item' });
        }

        // Update fields if provided
        const { title, description, category, status, location, dateLostFound } = req.body;
        if (title) item.title = title;
        if (description) item.description = description;
        if (category) item.category = category;
        if (status) item.status = status;
        if (location) item.location = location;
        if (dateLostFound) item.dateLostFound = dateLostFound;

        // Handle new image upload
        if (req.file) {
            item.imageUrl = `/uploads/${req.file.filename}`;
        }

        await item.save();

        res.json({ message: 'Item updated successfully', item });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating item', error: error.message });
    }
};


exports.deleteItem = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Only the owner or an admin can delete a listing
        if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized to delete this item' });
        }

        await Item.findByIdAndDelete(req.params.id);

        res.json({ message: 'Item listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting item', error: error.message });
    }
};

