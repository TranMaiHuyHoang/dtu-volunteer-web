
// 1. Nhập Named Export: getTokenFromHeader từ file utils
import { getTokenFromHeader } from '../utils/getTokenFromHeader.js';

// 2. SỬA LỖI: Nhập Named Export trực tiếp từ authCookie.js
import { clearAccessTokenCookie } from '../utils/authCookie.js';
import UserService from '../services/user.service.js';
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
async function verifyToken(req, res, next) {
    const token = getTokenFromHeader(req);

    if (!token) {
        logger.warn('AUTH_FAIL: Không có token trong Header.');
        return res.status(401).json({ message: 'Không được ủy quyền. Vui lòng cung cấp token.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.sub;

        // Tìm user trong DB để đảm bảo user còn tồn tại
        //NOTES: id được chuẩn hóa thành user.id qua hàm findById của user service
        const user = await UserService.findById(userId);

        if (!user) {
            logger.error(`AUTH_FAIL: Token hợp lệ nhưng UserID ${userId} không tồn tại trong DB.`);
            return res.status(401).json({ message: 'Tài khoản người dùng không tồn tại hoặc đã bị xóa.' });
        }

        // user.id = user._id.toString(); 
        
        // // 2. Xóa trường '_id' gốc và '__v' để nhất quán API
        // delete user._id; 
        // delete user.__v;
        // Gán dữ liệu an toàn
        req.auth = payload; // payload từ token
        req.user = user;    // user thật từ DB

        logger.info(`LOG-AUTH: ✅ OK | UserID: ${user._id} | Role: ${payload.role}`);
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const decoded = jwt.decode(token);
            clearAccessTokenCookie(res);
            // -logger.warn(`AUTH_FAIL: Token hết hạn | User: ${req.user?.sub || 'N/A'}`);
            logger.warn(`AUTH_FAIL: Token hết hạn | User: ${decoded?.sub || 'N/A'}`);
            return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.', expired: true });
        }
                // Token bị sửa hoặc sai signature
        if (error.name === 'JsonWebTokenError') {
            logger.warn('AUTH_FAIL: Token sai signature hoặc không hợp lệ.');
            return res.status(401).json({ message: 'Token không hợp lệ.' });
        }

    // Lỗi không xác định
        logger.error('AUTH_FAIL: Lỗi xác thực không xác định.', error);
        return res.status(500).json({ message: 'Lỗi máy chủ khi xác thực.' });
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