// Tệp: src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const { getTokenFromHeader } = require('../utils/getTokenFromHeader');
const { decodeTokenPayload } = require('../utils/decodeTokenPayload');

function verifyToken(req, res, next) {
    // 1. Lấy token từ header
    const token = getTokenFromHeader(req);
    if (!token) {
        return res.status(401).json({
            message: 'Không được ủy quyền. Vui lòng cung cấp token.'
        });
    }
    console.log('2. Token đầy đủ (chỉ 10 ký tự đầu):', token.substring(0, 10) + '...');
    const decodedPayload = decodeTokenPayload(token);
    console.log('3. Kết quả Giải mã Payload:', decodedPayload ? 'THÀNH CÔNG' : 'THẤT BẠI');

    if (!decodedPayload) {
        return res.status(401).json({
            message: 'Token không hợp lệ hoặc đã hết hạn.'
        });
    }

    // 4. Gắn Payload vào Request
    req.user = decodedPayload; 
    next();
}

/**
 * Xác thực token và kiểm tra quyền truy cập của Admin
 * 
 * @param {object} req - Đối tượng request (req) của Express
 * @param {object} res - Đối tượng response (res) của Express
 * @param {function} next - Hàm callback để gọi hàm tiếp theo
 */
function verifyTokenAndAdminAuth(req, res, next) {
    verifyToken(req, res, () => {
        // Kiểm tra nếu là Admin hoặc của chính chủ
       if (req.user.id == req.params.id || req.user.role === 'admin') {
        next();
       }
       else {
            // Không phải Admin
            return res.status(403).json({
                message: 'Bạn không có quyền truy cập (Yêu cầu quyền Admin).'
            });
        }
    });
}

module.exports = { verifyToken, verifyTokenAndAdminAuth };