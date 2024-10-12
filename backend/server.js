// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Create express app
const app = express();

// Use CORS middleware to allow cross-origin requests
app.use(cors());  // This will enable CORS for all routes

// Use body-parser middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Database connection (replace with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('Connected to MongoDB');
});

// User schema and model
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', UserSchema);

// Registration route (POST)
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// Login route (POST)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User does not exist' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT token
    const token = jwt.sign({ id: user._id }, 'yourSecretKey', { expiresIn: '1h' });
    res.status(200).json({ token });
});

// Test route to check if everything is working
app.get('/test', (req, res) => {
    res.send('API is working');
});

// Start server on port 8080
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
