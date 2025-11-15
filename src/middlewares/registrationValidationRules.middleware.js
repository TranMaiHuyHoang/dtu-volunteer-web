// registrationValidationRules.middleware.js - SỬ DỤNG ESM

// 1. Thay thế require bằng import cho Named Export từ express-validator
import { body } from 'express-validator';
// 2. Thay thế require bằng import cho Default Export từ Mongoose Models
import Project from '../models/project.model.js';
import Registration from '../models/registration.model.js';

// Quy tắc validation cho projectId
const projectIdRules = [
    body('projectId')
        .notEmpty()
        .withMessage('ProjectId là bắt buộc')
        .isMongoId()
        .withMessage('ProjectId không hợp lệ. Vui lòng nhập đúng định dạng ID.')
        .custom(async (projectId) => {
            // Kiểm tra Project tồn tại (Sử dụng Model đã import)
            const project = await Project.findById(projectId);
            if (!project) {
                throw new Error('Dự án không tồn tại');
            }
            return true;
        })
        .custom(async (projectId, { req }) => {
            // Kiểm tra tính duy nhất (Sử dụng Model đã import)
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

// Named Export (Đã đúng)
export {
    projectIdRules,
};