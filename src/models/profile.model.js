import { Schema, model } from 'mongoose';

const profileSchema = new Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, trim: true, lowercase: true },
	phone: { type: String, trim: true },
	address: { type: String, trim: true },
	notes: { type: String, trim: true }
}, { timestamps: true });

export default model('Profile', profileSchema);


