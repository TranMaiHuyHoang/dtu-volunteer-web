const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Xác minh và decode JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - Payload nếu hợp lệ, null nếu không hợp lệ
 */
const decodeTokenPayload = (token) => {
    if (!token) return null;
    
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        logger.error(`LỖI XÁC MINH JWT: ${error.name} - ${error.message}`);
        return null;
    }
};

module.exports = { decodeTokenPayload };