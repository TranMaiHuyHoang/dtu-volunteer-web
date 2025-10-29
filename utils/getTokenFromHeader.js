const logger = require('../config/logger');

/**
 * Lấy JWT từ header Authorization dạng "Bearer <token>".
 * @param {object} req - Đối tượng request (req) của Express.
 * @returns {string | null} - Token JWT hoặc null nếu không tìm thấy/sai định dạng.
 */
const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        // Trường hợp 1: Header không có hoặc sai định dạng
        logger.warn('LOG-AUTH: ❌ Thiếu hoặc lỗi Auth Header');
        return null;
    }
    
    // Trường hợp 2: Lấy token thành công
    const token = authHeader.split(' ')[1];
    // Chỉ log việc lấy token thành công, không log payload ở đây
    logger.info(`LOG-AUTH: ✅ Token được trích xuất (${token.substring(0, 5)}...)`);
    return token;
};
module.exports = {getTokenFromHeader};