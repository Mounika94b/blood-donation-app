const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'requester'],
    required: true
  },

  // 👇 Add these two fields for password reset functionality
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  }
});

module.exports = mongoose.model('user', userSchema);


