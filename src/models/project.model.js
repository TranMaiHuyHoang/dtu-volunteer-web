// models/project.model.js
import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['pending','approved','rejected','completed'], default: 'pending' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  volunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
  
export default model('Project', projectSchema);
