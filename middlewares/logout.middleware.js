// auth.middleware.js
// Giả định bạn đã import đối tượng logger (logger) từ cấu hình Winston

const logger = require('../config/logger');

const preLogoutLog = (req, res, next) => {
    let userId = 'UNKNOWN_USER';
    const session = req.session;

    const passportUserId = req.user?.id || session?.passport?.user;
    if (passportUserId) {
        userId = passportUserId;
    } else if (session?.userId) {
        userId = session.userId;
    }

    const sessionId = req.sessionID || 'UNKNOWN_SESSION';
    
    // Gán thông tin vào context
    req.logoutContext = { 
        userId, 
        sessionId,
        isUserAuthenticated: userId !== 'UNKNOWN_USER' 
    };
    
    // Log cảnh báo tường minh: Họ đã cố gắng logout khi chưa đăng nhập
    if (userId === 'UNKNOWN_USER') {
        logger.warn(`[LOGOUT ALERT - NOT AUTHENTICATED] User cố gắng truy cập /logout với Session ID: ${sessionId}.`);
        
        // Thêm một log khác để theo dõi
        logger.info(`[LOGOUT ATTEMPT] User ID: UNKNOWN_USER | Đã hủy Session rỗng. `);
    }

    next();
};
/**
 * Middleware để xử lý và log lỗi sau khi req.logout() thất bại.
 */
const postLogoutLog = (err, req, res, next) => {
    if (err.logoutContext || req.logoutContext) {
        
        const { userId, sessionId } = err.logoutContext || req.logoutContext || { 
            userId: 'UNKNOWN_USER', 
            sessionId: 'UNKNOWN_SESSION' 
        }; 
        
        logger.error(`[LOGOUT FAIL] User ID: ${userId} | Session ID: ${sessionId} | Lỗi: ${err.message}`, { 
            stack: err.stack,
            userId: userId 
        });
    }
    next(err); 
};

const successfulLogoutLog = (req, res, next) => {
    const { userId, sessionId, isUserAuthenticated } = req.logoutContext;
    
    if (isUserAuthenticated) {
        logger.info(`[LOGOUT SUCCESS] User ID: ${userId} | Session ID: ${sessionId} | Đăng xuất thành công.`);
    }
    
    res.status(200).json({
        status: 'success',
        message: isUserAuthenticated ? 'Đăng xuất thành công.' : 'Phiên làm việc không tồn tại hoặc đã hết hạn.'
    });
};
module.exports = { preLogoutLog, successfulLogoutLog, postLogoutLog };