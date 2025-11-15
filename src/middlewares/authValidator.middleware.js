// authValidator.middleware.js - SỬ DỤNG ESM

// Thay thế require bằng import cho Named Exports
import { usernameRules, emailRules, passwordRules } from './authValidationRules.middleware.js';

// 1. Validator Đăng ký
// Register cần username, email, và password
const registerValidator = [
    ...usernameRules,
    ...emailRules,
    ...passwordRules,
];

// 2. Validator Đăng nhập
// Login chỉ cần email và password
const loginValidator = [
    ...emailRules,
    ...passwordRules, 
];

// Named Export (Đã đúng)
export {
    registerValidator,
    loginValidator,
};