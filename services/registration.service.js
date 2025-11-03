const Project = require('../models/project.model');
const Registration = require('../models/registration.model');
const { BadRequestError, NotFoundError, ConflictError } = require('../errors/customError')

const registerForProject = async (projectId, userId) => {
    // 1. Kiểm tra thiếu dữ liệu
    if (!projectId || !userId) {
        throw new BadRequestError('Thiếu projectId hoặc userId');
    }

    // 2. Kiểm tra Project tồn tại
    const project = await Project.findById(projectId);
    if (!project) {
        throw new NotFoundError('Dự án không tồn tại');
    }

    // 3. Kiểm tra tính duy nhất
    const exists = await Registration.findOne({ projectId, userId });
    if (exists) {
        throw new ConflictError('Bạn đã đăng ký dự án này');
    }

    // 4. Tạo bản ghi đăng ký mới
    const reg = new Registration({
        projectId,
        userId,
        status: 'pending' // Trạng thái mặc định
    });
    await reg.save();
    return reg;
};

module.exports = { registerForProject };