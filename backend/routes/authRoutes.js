const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Pathway: POST /api/auth/register
// Practically: When a user fills out the mobile signup form and hits submit
router.post('/register', registerUser);

// Pathway: POST /api/auth/login
// Practically: When a user enters their email/password on the mobile login screen
router.post('/login', loginUser);

module.exports = router;