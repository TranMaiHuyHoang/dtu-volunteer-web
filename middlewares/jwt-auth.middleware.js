const { getTokenFromHeader } = require('../utils/getTokenFromHeader');
const { clearAccessTokenCookie } = require('../utils/authCookie');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware xác thực JWT token
 */
function verifyToken(req, res, next) {
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({ message: 'Không được ủy quyền. Vui lòng cung cấp token.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        logger.info(`LOG-AUTH: ✅ OK | UserID: ${payload.sub} | Role: ${payload.role}`);
        next();
    } catch (error) {
        // Token hết hạn: xóa cookie và trả về 401
        if (error.name === 'TokenExpiredError') {
            clearAccessTokenCookie(res);
            return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.', expired: true });
        }
        
        // Token không hợp lệ
        logger.warn('AUTH_FAIL: Token không hợp lệ.');
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
}

// --- MIDDLEWARE ỦY QUYỀN (AUTHORIZATION) ---

/**
 * Middleware 2: Hàm tạo Middleware (Factory) để kiểm tra Vai trò chung
 * Tương đương với hàm permit() đã thảo luận.
 */
const permit = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user; // Đã có do verifyToken chạy trước

        const userRole = (user && user.role) ? user.role : 'KHÔNG XÁC ĐỊNH';
        const userId = (user && user.sub) ? user.sub : (user && user.userId) ? user.userId : 'N/A';
        // Kiểm tra nếu vai trò người dùng CÓ trong danh sách cho phép
        if (user && allowedRoles.includes(user.role)) {
            next();
        } else {
            logger.warn(`AUTH_FAIL: User ${userId} có vai trò (${userRole}) bị TỪ CHỐI (403).`);
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
        }
    };
};


module.exports = { verifyToken, permit };