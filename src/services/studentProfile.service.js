import StudentProfileModel from "../models/studentProfile.model.js";
import UserModel from "../models/user.model.js";
import { NotFoundError } from "../errors/customError.js";
class StudentProfileService {
    async getProfileByUserId(userId) {
    // 🚧 Điểm Cần Cải Thiện 1: Validation
    // Nâng cấp: Sử dụng thư viện Validation (như Joi/Yup) cho logic phức tạp hơn.
    if (!userId) {
        // Sử dụng custom Error để tương thích với Error Handler chung của hệ thống
        throw new NotFoundError('User ID là bắt buộc.');
    }

    // --- BƯỚC 1: Lấy thông tin User cơ bản (BẮT BUỘC tồn tại) ---
    // Sử dụng .lean() để lấy POJO (Plain Old JavaScript Object) giúp tăng tốc.
    const userDocument = await UserModel.findById(userId)
        .select('fullName phone email avatarUrl')
        .lean();

    if (!userDocument) {
        // Xử lý lỗi rõ ràng khi User không tồn tại
        throw new NotFoundError(`Không tìm thấy Người dùng với ID: ${userId}`);
    }

    // --- BƯỚC 2: Lấy StudentProfile (CÓ THỂ KHÔNG tồn tại) ---
    let profileDocument = await StudentProfileModel.findOne({ user: userId });

    console.log("[DEBUG] profileDocument: ", profileDocument);

    // --- BƯỚC 3: Kết hợp Dữ liệu ---
    let studentProfileData;

    if (profileDocument) {
        // Nếu TÌM THẤY Profile, chuyển nó thành POJO để dễ dàng kết hợp
        // LƯU Ý: Nếu dùng Mongoose, dùng .toObject() hoặc .lean() nếu query
        studentProfileData = profileDocument.toObject ? profileDocument.toObject() : profileDocument;
        // 🚧 Điểm Cần Cải Thiện 2: Lọc trường
        delete studentProfileData._id; // Xóa _id của profile
        delete studentProfileData.user; // Xóa tham chiếu user lặp lại
    } else {
        console.warn(`Profile cho User ID ${userId} không tồn tại. Trả về thông tin User cơ bản.`);
        // Khởi tạo các trường profile bằng null/default rỗng để đảm bảo cấu trúc trả về nhất quán
        studentProfileData = {
            bio: null, // Ví dụ
            gpa: null  // Ví dụ
            // ... thêm các trường khác của StudentProfile với giá trị mặc định/rỗng
        };
    }

    // 🔑 Trả lời câu hỏi: Dữ liệu StudentProfile chưa được trả về vì bạn chưa kết hợp nó.
    // Dùng Spread Operator (...) để kết hợp User và Student Profile
    const finalProfile = {
        ...userDocument, // Thông tin User cơ bản
        ...studentProfileData // Thông tin StudentProfile (đã lọc _id, user)
    };

    console.log("Dữ liệu trả về cuối cùng: ", finalProfile);

    return finalProfile;
}
  async updateProfileByUserId(userId, requestData) {
    if (!userId) {
        // userId đã được truyền qua tham số, nên việc check này là cần thiết
        throw new NotFoundError('User ID is required');
    }

    // ✨ BƯỚC 1: Tách dữ liệu thành các DTO riêng biệt (SoC)
    // Loại bỏ userId khỏi Destructuring để tránh ghi đè lên tham số userId
    // ⚠️ Khi sử dụng kỹ thuật Rest Syntax (...studentProfileRestData), bạn phải cực kỳ cẩn thận để tránh cho phép người dùng cập nhật các trường nhạy cảm mà họ không được phép (ví dụ: isAdmin, isVerified, createdAt, v.v.)
    const {
        fullName,
        contactEmail,
        phone,
        // Lược bỏ tất cả các trường không mong muốn khác ở đây
        // Ví dụ: isAdmin, createdAt, v.v.

        // Phần còn lại sẽ là dữ liệu của StudentProfile
        ...studentProfileRestData
    } = requestData;

    // 1.1. Chuẩn bị DTO cho User
    const userDto = {
        fullName,
        contactEmail,
        phone
    };

    // 1.2. Chuẩn bị DTO cho StudentProfile
    // Lưu ý: Đảm bảo studentProfileRestData chỉ chứa các trường hợp lệ
    const profileDto = studentProfileRestData;

    // Thiết lập tùy chọn cập nhật chung
    const options = { new: true, runValidators: true, upsert: false };

    // --- BƯỚC 2: Cập nhật User ---
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $set: userDto },
            options
        );
        if (!updatedUser) {
            // Có thể ném lỗi hoặc chỉ log warning nếu User ID không tồn tại
            console.warn(`User with ID ${userId} not found, proceeding to update profile.`);
        }
    } catch (error) {
        // Xử lý lỗi cập nhật User (ví dụ: email đã tồn tại)
        console.error("Error updating User:", error);
        throw error;
    }


    // --- BƯỚC 3: Cập nhật StudentProfile (liên kết với User ID) ---
    // Sử dụng upsert: true nếu bạn muốn tạo Profile mới nếu chưa tồn tại
    const profileOptions = { ...options, upsert: true };

    const updatedProfile = await StudentProfileModel.findOneAndUpdate(
        { user: userId }, // Tìm hồ sơ dựa trên liên kết User ID
        {
            $set: profileDto, // Chỉ cập nhật các trường Profile
            $setOnInsert: {
                createdAt: new Date(),
                user: userId // Đảm bảo liên kết user khi tạo mới
            }
        },
        profileOptions
    ).lean();

    if (!updatedProfile) {
        // Trường hợp này hiếm xảy ra nếu đã dùng upsert: true
        throw new NotFoundError('Profile update failed');
    }

    // ✨ BƯỚC 4: Trả về kết quả (nên trả về dữ liệu đã được tổng hợp)
    // Để trả về format phẳng như yêu cầu ban đầu, bạn cần lấy User và Profile

    // Ví dụ trả về Profile đã cập nhật:
    return {
        // Các trường của StudentProfile đã cập nhật
        ...updatedProfile,
        // Thêm các trường User đã cập nhật (có thể cần fetch lại User)
        ...userDto
    };
}
// Thêm hồ sơ mới
// async createProfile(data) {
//     // Kiểm tra logic nghiệp vụ trước khi lưu
//     const existingProfile = await StudentProfile.findOne({ 
//         $or: [
//             { 'personalInfo.studentId': data.personalInfo.studentId },
//             { 'personalInfo.email': data.personalInfo.email }
//         ]
//     });

//     if (existingProfile) {
//         // Sử dụng ApiError khi có lỗi nghiệp vụ (ví dụ: trùng lặp)
//         throw new ApiError(409, 'Mã sinh viên hoặc Email đã tồn tại.');
//     }

//     const newProfile = new StudentProfile(data);
//     return newProfile.save();
// }

// // Cập nhật hồ sơ
// async updateProfile(id, data) {
//     const profile = await StudentProfile.findById(id);

//     if (!profile) {
//         throw new ApiError(404, 'Hồ sơ không tìm thấy.');
//     }

//     // Thực hiện cập nhật
//     Object.assign(profile, data);
//     return profile.save();
// }

// // Xóa hồ sơ
// async deleteProfile(id) {
//     const result = await StudentProfile.findByIdAndDelete(id);

//     if (!result) {
//         throw new ApiError(404, 'Hồ sơ không tìm thấy để xóa.');
//     }
//     return { message: 'Đã xóa thành công' };
// }
}
export default new StudentProfileService();