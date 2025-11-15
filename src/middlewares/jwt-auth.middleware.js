// auth.middleware.js - Sử dụng ESM

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 1. Nhập Named Export: getTokenFromHeader từ file utils
import { getTokenFromHeader } from '../utils/getTokenFromHeader.js';

// 2. SỬA LỖI: Nhập Named Export trực tiếp từ authCookie.js
import { clearAccessTokenCookie } from '../utils/authCookie.js';
// import authCookieUtils from '../utils/authCookie.js'; // KHÔNG CẦN NỮA
// const { clearAccessTokenCookie } = authCookieUtils; // KHÔNG CẦN NỮA

// 3. Nhập thư viện CommonJS: jsonwebtoken
import pkg from 'jsonwebtoken';
const jwt = pkg; 

// 4. Nhập Default Export và trích xuất: logger
import loggerInstance from '../config/logger.js';
const logger = loggerInstance; 

// 5. Cấu hình biến môi trường
import 'dotenv/config'; 
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware xác thực JWT token
 */
function verifyToken(req, res, next) {
    const token = getTokenFromHeader(req);
    // ... (logic verifyToken không đổi) ...
    if (!token) {
        logger.warn('AUTH_FAIL: Không có token trong Header.'); 
        return res.status(401).json({ message: 'Không được ủy quyền. Vui lòng cung cấp token.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        logger.info(`LOG-AUTH: ✅ OK | UserID: ${payload.sub} | Role: ${payload.role}`);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            clearAccessTokenCookie(res);
            logger.warn(`AUTH_FAIL: Token hết hạn | User: ${req.user?.sub || 'N/A'}`);
            return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.', expired: true });
        }
        
        logger.warn('AUTH_FAIL: Token không hợp lệ.');
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
}

// --- MIDDLEWARE ỦY QUYỀN (AUTHORIZATION) ---

const permit = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            logger.warn('AUTH_FAIL: Không có thông tin người dùng (req.user is null/undefined).');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRole = user.role || 'KHÔNG XÁC ĐỊNH';
        const userId = user.sub || user.userId || 'N/A';
        
        if (allowedRoles.includes(user.role)) {
            next();
        } else {
            logger.warn(`AUTH_FAIL: User ${userId} có vai trò (${userRole}) bị TỪ CHỐI (403).`);
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện chức năng này.' });
        }
    };
};

export { verifyToken, permit };