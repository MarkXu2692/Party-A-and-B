// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Ensure the User model is imported
const authenticateToken = require('./middlewares/auth'); // Import the middleware

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection (your MongoDB URI)
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Registration route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({ username, email, password: hashedPassword });

  // Save user to database
  await newUser.save();
  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Create JWT token
  const token = jwt.sign({ id: user._id, username: user.username }, 'yourSecretKey', { expiresIn: '1h' });

  // Send token to client
  res.status(200).json({ token });
});

// Protected route example
app.get('/dashboard', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to your dashboard', user: req.user });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
