const jwt = require('jsonwebtoken');

// Đảm bảo tải biến môi trường
require('dotenv').config();

// Lấy JWT_SECRET và JWT_EXPIRES_IN từ biến môi trường (nhất quán với decodeTokenPayload.js)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

/**
 * Hàm tạo JWT access token (sign)
 * @param {object} payload - Dữ liệu muốn nhúng vào token (ví dụ: { sub: userId, role: 'admin', email: 'user@example.com' })
 * @returns {string} - JWT token đã được ký
 */
const generateAccessToken = (payload) => {
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