const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});
registrationSchema.index({ projectId: 1, userId: 1 }, { unique: true });
module.exports = mongoose.model('Registration', registrationSchema);
