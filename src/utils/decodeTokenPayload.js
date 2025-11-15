// Thay thế require bằng import
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js'; // 1. Giả sử logger dùng export default, cần thêm .js
import 'dotenv/config'; // 2. Thay thế require('dotenv').config() bằng import 'dotenv/config'

// 3. Không cần JWT_SECRET. Bạn sẽ lấy biến môi trường trong file config hoặc .env
// Lấy biến môi trường trực tiếp từ process.env
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Xác minh và decode JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Payload nếu hợp lệ, null nếu không hợp lệ
 */
const decodeTokenPayload = (token) => {
    if (!token) return null;
    
    try {
        // Sử dụng hàm jwt.verify đã được import
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        // Sử dụng logger đã được import
        logger.error(`LỖI XÁC MINH JWT: ${error.name} - ${error.message}`);
        return null;
    }
};

// Sử dụng named export ES6
export { decodeTokenPayload };