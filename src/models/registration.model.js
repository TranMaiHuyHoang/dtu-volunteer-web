import { Schema, model } from 'mongoose';

const registrationSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  registeredAt: { type: Date, default: Date.now }
});
registrationSchema.index({ projectId: 1, userId: 1 }, { unique: true });
export default model('Registration', registrationSchema);
