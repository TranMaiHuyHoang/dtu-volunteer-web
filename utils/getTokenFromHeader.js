const logger = require('../config/logger');

/**
 * Lấy JWT token từ Authorization header hoặc từ cookie
 * Priority: Authorization header (Bearer token) > Cookie (accessToken)
 * @param {object} req - Express request object
 * @returns {string|null} - JWT token hoặc null nếu không tìm thấy
 */
const getTokenFromHeader = (req) => {
    // Ưu tiên 1: Lấy từ Authorization header (cho REST client)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token.trim()) {
            const trimmedToken = token.trim();
            // Kiểm tra format JWT cơ bản (có 3 phần: header.payload.signature)
            if (trimmedToken.split('.').length === 3) {
                logger.info(`LOG-AUTH: ✅ Token được trích xuất từ Authorization header (${trimmedToken.substring(0, 10)}...)`);
                return trimmedToken;
            } else {
                logger.warn(`LOG-AUTH: ⚠️ Token từ Authorization header có format không hợp lệ (không phải JWT với 3 phần): ${trimmedToken.substring(0, 20)}`);
            }
        } else {
            logger.warn(`LOG-AUTH: ⚠️ Token từ Authorization header là empty hoặc chỉ có spaces`);
        }
    }
    
    // Ưu tiên 2: Lấy từ cookie (đơn giản hơn, tự động gửi kèm request)
    const tokenFromCookie = req.cookies?.accessToken || req.signedCookies?.accessToken;
    if (tokenFromCookie) {
        logger.info(`LOG-AUTH: ✅ Token được trích xuất từ cookie (${tokenFromCookie.substring(0, 5)}...)`);
        return tokenFromCookie;
    }
    
    // Không tìm thấy token
    logger.warn('LOG-AUTH: ❌ Không tìm thấy token trong Authorization header hoặc cookie');
    return null;
};
module.exports = {getTokenFromHeader};