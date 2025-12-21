// import { Schema, model } from 'mongoose';

// const profileSchema = new Schema({
// 	name: { type: String, required: true, trim: true },
// 	email: { type: String, required: true, trim: true, lowercase: true },
// 	phone: { type: String, trim: true },
// 	address: { type: String, trim: true },
// 	notes: { type: String, trim: true }
// }, { timestamps: true });

// export default model('Profile', profileSchema);
import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
    // THÔNG TIN CÁ NHÂN (PERSONAL INFO)
    personalInfo: {
        fullName: { 
            type: String, 
            required: true, 
            trim: true 
        },
        studentId: { 
            type: String, 
            required: true, 
            unique: true, // Đảm bảo Mã sinh viên là duy nhất
            trim: true 
        },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true,
            lowercase: true // Lưu email dưới dạng chữ thường
        },
        phone: { 
            type: String, 
            required: true, 
            trim: true 
        },
        dateOfBirth: { 
            type: Date, // Sử dụng kiểu Date để dễ dàng thao tác
            required: true 
        },
        gender: { 
            type: String, 
            enum: ['Nam', 'Nữ', 'Khác'], // Giới hạn các giá trị có thể
            required: true 
        },
        avatarUrl: { 
            type: String, 
            default: null 
        }
    },

    // THÔNG TIN HỌC TẬP (ACADEMIC INFO)
    academicInfo: {
        faculty: { 
            type: String, 
            required: true, 
            trim: true 
        },
        major: { 
            type: String, 
            required: true, 
            trim: true 
        },
        academicYear: { 
            type: Number, // Dùng Number để dễ dàng so sánh
            required: true,
            min: 1
        },
        class: { 
            type: String, 
            required: true, 
            trim: true 
        }
    },

    // KỸ NĂNG & SỞ THÍCH (SKILLS & PREFERENCES)
    skillsAndPreferences: {
        skills: { 
            type: [String], // Mảng các chuỗi
            default: [] 
        },
        bio: { 
            type: String, 
            trim: true,
            maxlength: 500 // Giới hạn 500 ký tự như trên form
        }
    }
}, {
    timestamps: true // Tự động thêm các trường createdAt và updatedAt
});

// Tạo Model
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

export default StudentProfile;