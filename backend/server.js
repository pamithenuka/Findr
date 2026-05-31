const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require ('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows the server to accept JSON data

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch((err) => console.error('MongoDB connection error:', err));


// Test Route
app.get('/', (req, res) => {
    res.send('Lost and Found API is running smoothly!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is roaring to life on port ${PORT}`);
});