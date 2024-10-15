// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');  // Ensure the User model is imported
const authenticateToken = require('./middlewares/auth'); // Import the middleware
const crypto = require('crypto'); // generating reset token

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';  // Ensure this is defined

mongoose.connect(mongoURI)
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

  // Create JWT token with expiration
  const token = jwt.sign({ id: user._id, username: user.username }, 'yourSecretKey', { expiresIn: '1h' });

  // Send token to client
  res.status(200).json({ token });
});

// Profile route (protected)
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching profile for user:', req.user.id);  // Log user ID for debugging
    const user = await User.findById(req.user.id).select('-password');  // Exclude password from the result

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);  // Log found user for debugging
    res.json(user);  // Send user details as JSON
  } catch (err) {
    console.error('Error fetching profile:', err);  // Log any error during fetching
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to request password reset
app.post('/request-reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token and expiration on user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Simulate sending email (you can print it for now)
    const resetLink = `http://localhost:8080/reset-password/${resetToken}`;
    console.log(`Password reset link: ${resetLink}`);
    console.log('Token expires at:', new Date(user.resetPasswordExpires));

    res.status(200).json({ message: 'Password reset link has been sent to your email' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to reset password
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log('Received token:', token);

  try {
    // Find the user with this token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },  // Ensure the token hasn't expired
    });

    if (!user) {
      console.log('User not found or token expired');
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log('User found:', user);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
