import { body } from 'express-validator';
import { param } from 'express-validator';
import mongoose from 'mongoose';
// 1. Quy tắc Tái sử dụng cho USERNAME - dành cho đăng nhập
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



const validateIdParam = [
    // 1. Kiểm tra tham số 'id' có tồn tại không
    param('id')
        .notEmpty().withMessage('ID hồ sơ không được để trống trong URL'),
    
    // 2. Kiểm tra định dạng ID có phải là MongoDB ObjectId hợp lệ không
    param('id')
        .custom((value) => {
            // Sử dụng mongoose.Types.ObjectId.isValid() để kiểm tra định dạng
            if (!mongoose.Types.ObjectId.isValid(value)) {
                // Nếu không hợp lệ, ném ra lỗi. express-validator sẽ bắt lỗi này.
                throw new Error('ID hồ sơ không hợp lệ. Vui lòng kiểm tra định dạng.');
            }
            return true; // Hợp lệ
        })
];

const nameRules = [
    body('name')
        .trim()
        // Chuẩn hóa nhiều khoảng trắng về một
        .customSanitizer(value => value.replace(/\s+/g, ' ').trim())

        // Độ dài
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự')

        // Chỉ chữ cái Unicode + khoảng trắng
        .matches(/^[\p{L}\s]+$/u)
        .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng')
];

const phoneRules = [
    body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isMobilePhone(['vi-VN']).withMessage('SĐT không hợp lệ (VN)')
];

const addressRules = [
    body('address')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('Địa chỉ không được quá 255 ký tự')
];
const notesRules = [
    body('notes')
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Ghi chú không được quá 500 ký tự')
];



export {
    usernameRules,
    emailRules,
    passwordRules,
    validateIdParam,
    nameRules,
    phoneRules,
    addressRules,
    notesRules
};
