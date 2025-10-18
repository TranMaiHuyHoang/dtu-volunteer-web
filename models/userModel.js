const mongoose = require('mongoose');
const { hashPassword } = require('../utils/hash');

const userSchema = new mongoose.Schema({
  googleId: {type: String, unique: true, sparse : true },
  username: { type: String, trim: true },
  email: {
    type: String, required: true, unique: true,
    set: (value) => typeof value === 'string' ? value.trim().toLowerCase() : value
  },
  password: { type: String, required: function() { return !this.googleId; } }
});


// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

module.exports = mongoose.model('User', userSchema);
