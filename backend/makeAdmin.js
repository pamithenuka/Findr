const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        // Find the most recently created user or the first user
        const user = await User.findOne().sort({ createdAt: -1 });
        
        if (!user) {
            console.log('No users found! Please register an account first in the app.');
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();
        
        console.log(`Success! Elevated user ${user.email} to ADMIN role.`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

makeAdmin();
