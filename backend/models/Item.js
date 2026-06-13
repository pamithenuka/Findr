const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title (e.g., iPhone 13 Pro)'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description of the item'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Electronics', 'Documents & IDs', 'Bags & Wallets', 'Clothing', 'Keys', 'Others']
    },
    status: {
        type: String,
        required: [true, 'Is this item lost or found?'],
        enum: ['lost', 'found'], 
        default: 'lost'
    },
    location: {
        type: String,
        required: [true, 'Please specify the location (e.g., Canteen, Lab 3)'],
        trim: true
    },
    imageUrl: {
        type: String,
        default: '' 
    },
    dateLostFound: {
        type: Date,
        default: Date.now
    },
    
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    isResolved: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Item', ItemSchema);