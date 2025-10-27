// utils/signToken.js
const jwt = require('jsonwebtoken');

// Đảm bảo tải biến môi trường nếu cần thiết (ví dụ: dùng dotenv)
require('dotenv').config(); 

// Lấy Khóa Bí Mật và Thời gian hết hạn từ biến môi trường
// Đây là chìa khóa để dễ quản lý: bạn chỉ cần thay đổi trong file .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/**
 * Hàm ký JWT đơn giản và dễ quản lý.
 * @param {object} payload - Dữ liệu muốn nhúng vào token (ví dụ: { userId: 1, role: 'admin' })
 * @returns {string} - JWT đã ký
 */
const generateAccessToken = (payload) => {
    // 1. Ký (Sign) token với payload, khóa bí mật, và thời gian hết hạn cố định.
    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: 'HS256'
        }
    );
};


module.exports = {generateAccessToken};