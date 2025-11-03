const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

// Đảm bảo tải biến môi trường
require('dotenv').config();

// Lấy JWT_SECRET từ biến môi trường (nhất quán với generateAccessToken.js)
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Hàm xác minh và decode JWT token (verify + decode)
 * @param {string} token - JWT token cần xác minh và decode
 * @returns {object|null} - Payload đã decode nếu token hợp lệ, null nếu không hợp lệ
 */
const decodeTokenPayload = (token) => {
    if (!token) {
        return null;
    }

    try {
        // jwt.verify() vừa verify chữ ký vừa decode payload
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        // Bắt lỗi: token hết hạn, chữ ký sai, format sai, v.v.
        logger.error(`LỖI XÁC MINH JWT: ${error.name} - ${error.message}`);
        return null;
    }
};

module.exports = { decodeTokenPayload };