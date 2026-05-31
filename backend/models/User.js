const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    phoneNumber: {
        type: String,
        trim: true,
        maxlength: [10, 'Phone number cannot exceed 10 digits'],
        default: ''
    },
    
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user' 

    },
    isBanned: {
        type: Boolean,
        default: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);