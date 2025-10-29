const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
/**
 * Hàm Xác minh Token (Hàm tiện ích nội bộ)
 * @param {string} token - JWT cần xác minh.
 * @returns {object|null} - Payload đã giải mã nếu token hợp lệ.
 */
const decodeTokenPayload = (token) => {
    try {
        // Trả về payload đã giải mã
        return jwt.verify(token, process.env.JWT_SECRET); 
    } catch (error) {
        // Bắt lỗi hết hạn, chữ ký sai, v.v.
        logger.error('LỖI GIẢI MÃ JWT:', error.name); 
        logger.error('Chi tiết:', error.message);
        return null;
    }
};

module.exports = { decodeTokenPayload };