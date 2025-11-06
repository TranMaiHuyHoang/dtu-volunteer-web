const { body } = require('express-validator');
const Project = require('../models/project.model');
const Registration = require('../models/registration.model');

// Quy tắc validation cho projectId
const projectIdRules = [
    body('projectId')
        .notEmpty()
        .withMessage('ProjectId là bắt buộc')
        .isMongoId()
        .withMessage('ProjectId không hợp lệ. Vui lòng nhập đúng định dạng ID.')
        .custom(async (projectId) => {
            // Kiểm tra Project tồn tại
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Dự án không tồn tại');
            }
            return true;
        })
        .custom(async (projectId, { req }) => {
            // Kiểm tra tính duy nhất - chỉ chạy nếu có userId từ JWT
            if (req.user && req.user.sub) {
                const userId = req.user.sub;
                const exists = await Registration.findOne({ projectId, userId });
                if (exists) {
                    throw new Error('Bạn đã đăng ký dự án này');
                }
            }
            return true;
        })
];

module.exports = {
    projectIdRules,
};

