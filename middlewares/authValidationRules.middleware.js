
const { body } = require('express-validator');

// 1. Quy tắc Tái sử dụng cho USERNAME
const usernameRules = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Tên người dùng phải từ 3-30 ký tự')
        .isAlphanumeric()
        .withMessage('Tên người dùng chỉ được chứa chữ và số'),
];

// 2. Quy tắc Tái sử dụng cho EMAIL
const emailRules = [
    body('email')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),
];

// 3. Quy tắc Tái sử dụng cho PASSWORD (Yêu cầu mật khẩu mạnh)
const passwordRules = [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Mật khẩu phải có ít nhất 8 ký tự'),
        
    // Quy tắc phức tạp: Chữ hoa, chữ thường, số
    body('password')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
];

module.exports = {
    usernameRules,
    emailRules,
    passwordRules,
};