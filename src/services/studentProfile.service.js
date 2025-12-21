import StudentProfile from "../models/studentProfile.model.js";
import {ApiError} from "../errors/ApiError.js";
class StudentProfileService {

    // Lấy tất cả hồ sơ hoặc tìm kiếm
    async getAllProfiles(query) {
        // Xây dựng logic tìm kiếm dựa trên query (ví dụ: tên, mã sinh viên)
        const filter = query ? { 
            $or: [
                { 'personalInfo.fullName': { $regex: query, $options: 'i' } },
                { 'personalInfo.studentId': query }
            ]
        } : {};
        
        return StudentProfile.find(filter).lean(); // lean() giúp truy vấn nhanh hơn
    }

    // Thêm hồ sơ mới
    async createProfile(data) {
        // Kiểm tra logic nghiệp vụ trước khi lưu
        const existingProfile = await StudentProfile.findOne({ 
            $or: [
                { 'personalInfo.studentId': data.personalInfo.studentId },
                { 'personalInfo.email': data.personalInfo.email }
            ]
        });

        if (existingProfile) {
            // Sử dụng ApiError khi có lỗi nghiệp vụ (ví dụ: trùng lặp)
            throw new ApiError(409, 'Mã sinh viên hoặc Email đã tồn tại.');
        }

        const newProfile = new StudentProfile(data);
        return newProfile.save();
    }

    // Cập nhật hồ sơ
    async updateProfile(id, data) {
        const profile = await StudentProfile.findById(id);

        if (!profile) {
            throw new ApiError(404, 'Hồ sơ không tìm thấy.');
        }

        // Thực hiện cập nhật
        Object.assign(profile, data);
        return profile.save();
    }

    // Xóa hồ sơ
    async deleteProfile(id) {
        const result = await StudentProfile.findByIdAndDelete(id);
        
        if (!result) {
            throw new ApiError(404, 'Hồ sơ không tìm thấy để xóa.');
        }
        return { message: 'Đã xóa thành công' };
    }
}

export default new StudentProfileService();