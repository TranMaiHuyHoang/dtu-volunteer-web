import mongoose from 'mongoose';

const OrganizerProfileSchema = new mongoose.Schema({
    organizationName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    // Lưu trữ thông tin chỉ cần lưu một lần
    contactEmail: { type: String, required: true, trim: true, unique: true },
    isVerified: { type: Boolean, default: false },
    logoUrl: { type: String, trim: true },
    // ... các thông tin khác của tổ chức
});


export default mongoose.model('OrganizerProfile', OrganizerProfileSchema);
