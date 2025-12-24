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
<<<<<<< HEAD

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
=======
import { Schema } from 'mongoose';


//❗❗❗ có sự trùng lặp 1 số nội dung của User. 
const studentProfileSchema = new mongoose.Schema({
    // THÔNG TIN CẤP GỐC
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // 1. THÔNG TIN CÁ NHÂN (PERSONAL INFO) - Đã làm phẳng
    studentId: { 
        type: String, 
        required: true, 
        unique: true, // Đảm bảo Mã sinh viên là duy nhất
        trim: true 
    },
    contactEmail: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true // Lưu email dưới dạng chữ thường
    },
    dateOfBirth: { // Sử dụng lại dateOfBirth
        type: Date, 
        required: true 
    },
    gender: { 
        type: String, 
        enum: ['male', 'female', 'other'], 
        required: true 
    },
    // 2. THÔNG TIN HỌC TẬP (ACADEMIC INFO) - Đã làm phẳng
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
    academicYear: { // Sử dụng lại academicYear (tương ứng với trường 'year' ở frontend)
        type: Number, 
        required: true,
        min: 1
    },
    class: { 
        type: String, 
        trim: true 
    },

    // 3. KỸ NĂNG & SỞ THÍCH (SKILLS & PREFERENCES) - Đã làm phẳng
    skills: { 
        type: [String], // Mảng các chuỗi
        default: [] 
    },
    bio: { 
        type: String, 
        trim: true,
        maxlength: 500 // Giới hạn 500 ký tự
    }
}, {
    timestamps: true, // Tự động thêm các trường createdAt và updatedAt
});
//     toObject: { virtuals: true, transform: transformStudentProfile },
//     toJSON: { virtuals: true, transform: transformStudentProfile }
    
// });

// //###transform
// /**
//  * Chức năng: Dọn dẹp các trường nội bộ của Mongoose/MongoDB. 
//  * KHÔNG làm phẳng đối tượng lồng nhau (user) hay xử lý logic nghiệp vụ.
//  */
// function transformStudentProfile(doc, ret, options) {
//     // ret là đối tượng POJO (Plain JavaScript Object)
    
//     // Xóa các trường nội bộ/không cần thiết
//     delete ret._id; 
//     delete ret.__v;
    
//     // (Lưu ý: Bạn có thể giữ lại createdAt và updatedAt cho mục đích API)
//     // Nếu muốn xóa luôn, hãy thêm vào đây:
//     // delete ret.createdAt;
//     // delete ret.updatedAt;

//     // console.log("đã chạy qua dòng transform"); // Có thể xóa sau khi debug
    
//     // PHẢI TRẢ VỀ ret (đã được dọn dẹp)
//     return ret;
// }

// studentProfileSchema.methods.toProfileResponse = function() {
//     // 1. Lấy POJO và sử dụng Destructuring để lấy user và các trường cần thiết.
//     // LƯU Ý: Đặt toJSON() vào biến để dễ thao tác và xóa các trường nội bộ.
//     const profile = this.toJSON({ virtuals: true });
    
//     // 2. Trích xuất User và Profile, đồng thời áp dụng giá trị mặc định.
//     const user = profile.user || {}; 
    
//     // 3. Xóa các trường nội bộ/lồng nhau ngay sau khi trích xuất
//     delete profile.user; 
//     // Các trường khác như _id, __v, createdAt, updatedAt nên được xóa trong 'transform'
//     // (Giả sử bạn đã xóa chúng trong hàm transform).
    
//     // --- TRẢ VỀ KẾT QUẢ CUỐI CÙNG ---
//     return {
//         // ID chuẩn hóa
//         userId: user._id?.toString() || null, 

//         // 1. TRẢI ra tất cả các trường đã dọn dẹp của Profile (studentId, academicYear, v.v.)
//         ...profile,

//         // 2. GHI ĐÈ / BỔ SUNG: Áp dụng logic làm phẳng và chuẩn hóa
        
//         // Làm phẳng và chuẩn hóa từ User (Ghi đè nếu có)
//         fullName: user.fullName || null,
//         phone: user.phone || null,
//         avatarUrl: user.avatarUrl || null,
//         loginEmail: user.email || null, // Thêm/Bổ sung Email Đăng nhập
        
//         // Ghi đè/Chuẩn hóa lại từ Profile
//         contactEmail: profile.contactEmail || null, 
//         bio: profile.bio || null, 
//         skills: Array.isArray(profile.skills) ? profile.skills : [], 
//     };
// };

>>>>>>> 52203030bb34a7492dc04b587052c8ca74182db4

// Tạo Model
const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

export default StudentProfile;