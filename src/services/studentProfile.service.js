import StudentProfile from "../models/studentProfile.model.js";
import {ApiError} from "../errors/ApiError.js";
import { NotFoundError, BadRequestError } from "../errors/customError.js";
import mongoose from "mongoose";
class StudentProfileService {

    // Lấy tất cả hồ sơ hoặc tìm kiếm
    // async getAllProfiles(query) {
    //     // Xây dựng logic tìm kiếm dựa trên query (ví dụ: tên, mã sinh viên)
    //     const filter = query ? { 
    //         $or: [
    //             { 'personalInfo.fullName': { $regex: query, $options: 'i' } },
    //             { 'personalInfo.studentId': query }
    //         ]
    //     } : {};
        
    //     return StudentProfile.find(filter).lean(); // lean() giúp truy vấn nhanh hơn
    // }
    async getProfileByUserId(userId) {
    if (!userId) {
        throw new NotFoundError('User ID is required for profile retrieval.');
    }
    // let objectId;
    // try {
    //     // ✅ Chuyển đổi ID chuỗi sang ObjectId (do Schema yêu cầu)
    //     objectId = new mongoose.Types.ObjectId(userId); 
    //     console.log( " ✅ Chuyển đổi ID chuỗi sang ObjectId: " + objectId)
    // } catch (error) {
    //     throw new BadRequestError('User ID provided is not a valid format:' + error);
    // }

    // Truy vấn bằng ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    const profile = await StudentProfile.findOne({ userId: objectId }).lean();
    // const profile = await StudentProfile.findOne({ userId: new mongoose.Types.ObjectId("69169bd151394f9503962c09") }).lean();

    if (!profile) {
        throw new NotFoundError('Profile not found for the given User ID:' + userId);
        // Có thể tạo một tài liệu profile cơ bản nếu chưa tồn tại
        // throw new Error('Profile not found.'); 
    }
    
    return profile;
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