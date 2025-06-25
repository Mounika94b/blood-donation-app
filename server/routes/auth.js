const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// -------------------- Register --------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bloodGroup, city, contactNumber, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, bloodGroup, city, contactNumber, role });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// -------------------- Login --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        bloodGroup: user.bloodGroup,
        city: user.city,
        contactNumber: user.contactNumber,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});
// -------------------- Forgot Password --------------------
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If this email is registered, a reset link will be sent." });
    }

    // Generate a token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Save token and expiry in the user record
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // In real app: Send via email
    res.status(200).json({
      message: "Reset token generated successfully. Use it within 15 minutes.",
      token: resetToken // Only for testing; don’t send in production
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: "Error generating reset token" });
  }
});
// -------------------- Get All Users --------------------
router.get('/all-users', async (req, res) => {
  try {
    const users = await User.find({}, '-password -resetToken -resetTokenExpiry'); // exclude sensitive fields
    res.json(users);
  } catch (err) {
    console.error("Get All Users Error:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;

