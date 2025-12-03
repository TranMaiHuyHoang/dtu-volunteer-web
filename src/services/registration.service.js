// registration.service.js - SỬ DỤNG ESM

// 1. SỬA LỖI REQUIRE: Thay thế require bằng import (Default Export cho Mongoose Model)
import Registration from '../models/registration.model.js';

const registerForProject = async (projectId, userId) => {
    // Tạo bản ghi đăng ký mới
    // Validation đã được xử lý bởi express-validator middleware
    const reg = new Registration({
        projectId,
        userId,
        status: 'pending' // Trạng thái mặc định
    });
    await reg.save();
    return reg;
};

// 2. SỬA LỖI ĐÁNH MÁY: Đổi 'sregisterForProject' thành 'registerForProject'
export default registerForProject;