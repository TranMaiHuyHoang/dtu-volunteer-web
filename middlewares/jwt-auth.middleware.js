/**
 * Middleware xác thực JWT token
 * Flow: Lấy token từ Authorization header -> Verify và decode -> Gắn payload vào req.user
 */
const { getTokenFromHeader } = require('../utils/getTokenFromHeader');
const { decodeTokenPayload } = require('../utils/decodeTokenPayload');
const logger = require('../config/logger');

/**
 * Middleware xác thực JWT token từ Authorization header
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
function verifyToken(req, res, next) {
    // 1. Lấy token từ header Authorization
    const token = getTokenFromHeader(req);
    if (!token) {
        logger.warn('AUTH_FAIL: Token không được cung cấp.');
        return res.status(401).json({
            message: 'Không được ủy quyền. Vui lòng cung cấp token.'
        });
    }

    // 2. Verify và decode JWT token
    const decodedPayload = decodeTokenPayload(token);
    if (!decodedPayload) {
        logger.warn('AUTH_FAIL: Token không hợp lệ (lỗi giải mã/xác minh).');
        return res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }

    // 3. Gắn Payload vào Request object
    req.user = decodedPayload;
    logger.info(`LOG-AUTH: ✅ OK | UserID (Sub): ${decodedPayload.sub} | Role: ${decodedPayload.role}`);
    next();
}

/**
 * Xác thực token và kiểm tra quyền truy cập của Admin
 * 
 * @param {object} req - Đối tượng request (req) của Express
 * @param {object} res - Đối tượng response (res) của Express
 * @param {function} next - Hàm callback để gọi hàm tiếp theo
 */
// function verifyTokenAndAdminAuth(req, res, next) {
//     verifyToken(req, res, () => {
//         // Kiểm tra nếu là Admin hoặc của chính chủ
//        if (req.user.id == req.params.id || req.user.role === 'admin') {
//         next();
//        }
//        else {
//             // Không phải Admin
//             return res.status(403).json({
//                 message: 'Bạn không có quyền truy cập (Yêu cầu quyền Admin).'
//             });
//         }
//     });
// }

// --- MIDDLEWARE ỦY QUYỀN (AUTHORIZATION) ---

/**
 * Middleware 2: Hàm tạo Middleware (Factory) để kiểm tra Vai trò chung
 * Tương đương với hàm permit() đã thảo luận.
 */
const permit = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user; // Đã có do verifyToken chạy trước

        const userRole = (user && user.role) ? user.role : 'KHÔNG XÁC ĐỊNH';
        const userId = (user && user.userId) ? user.userId : 'N/A'; // Giả sử payload có userId
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