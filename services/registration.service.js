const Registration = require('../models/registration.model');

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

module.exports = { registerForProject };