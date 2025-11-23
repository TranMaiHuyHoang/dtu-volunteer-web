import { Schema, model } from 'mongoose';
import { hashPassword } from '../utils/hash.js';

const userSchema = new Schema({
  googleId: {type: String },
  username: { type: String, trim: true },
  email: {
    type: String, required: true, unique: true,
    set: (value) => typeof value === 'string' ? value.trim().toLowerCase() : value
  },
  password: { type: String, required: function() { return !this.googleId; } },
  role: {
    type: String,
    enum: ['admin', 'organizer', 'volunteer'], // Chỉ chấp nhận các giá trị này
    default: 'volunteer', // Vai trò mặc định cho người dùng mới
    required: true // Bắt buộc phải có vai trò
  }
});

// Index hóa googleId làm trường phụ (unique secondary index)
// sparse: true cho phép null/undefined (chỉ user local không có googleId)
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

export default model('User', userSchema);
