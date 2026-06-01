const jwt = require('jsonwebtoken');
const User = require('../models/User');

// MIDDLEWARE 1: Protects routes from non-logged-in or banned users
const protect = async (req, res, next) => {
    let token;

    // Check if the request contains a Bearer token in the Authorization headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from string: "Bearer eyJhbGci..." -> "eyJhbGci..."
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our hidden secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch the user profile from MongoDB using the token's ID (exclude password hash)
            req.user = await User.findById(decoded.id).select('-password');

            // REAL-WORLD MODERATION: Instantly lock out banned users even if their token is valid
            if (req.user && req.user.isBanned) {
                return res.status(403).json({ message: 'Access denied. This account has been suspended.' });
            }

            // Everything checks out! Move forward to the controller
            next();

        } catch (error) {
            console.error('Token verification failed ❌:', error.message);
            return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
        }
    }

    // If no token exists at all
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no security token provided' });
    }
};

// MIDDLEWARE 2: Restricts specific routes strictly to Admins
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is an admin, let them pass
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };