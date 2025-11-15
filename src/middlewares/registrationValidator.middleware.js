// registrationValidator.middleware.js - SỬ DỤNG ESM

// Thay thế require bằng import cho Named Export
import { projectIdRules } from './registrationValidationRules.middleware.js';

// Validator cho đăng ký dự án
const registerForProjectValidator = [
    ...projectIdRules,
];

// Named Export (Đã đúng)
export {
    registerForProjectValidator,
};