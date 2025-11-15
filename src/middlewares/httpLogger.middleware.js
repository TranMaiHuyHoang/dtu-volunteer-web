 import logger from "../config/logger.js";
const { http } = logger;

function httpLogger(req, res, next) {
       // 1. Bắt đầu tính thời gian
    const start = Date.now();
    
    // 2. Ghi log Request (thông tin yêu cầu)
    http(`[REQ] ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        // LỌC BODY: Chỉ ghi log body nếu không phải là request đăng nhập/đăng ký
        body: req.originalUrl.includes('login') || req.originalUrl.includes('register') ? 
              '*** HIDDEN ***' : req.body,
        query: req.query,
        // (Tùy chọn) Thêm User ID nếu đã xác thực
        userId: req.user ? req.user.id : 'Guest' 
    });

    // 3. Bắt sự kiện 'finish' để ghi log Response
    res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Ghi log Response (thông tin phản hồi)
        http(`[RES] ${res.statusCode} ${req.method} ${req.originalUrl}`, {
            durationMs: duration, // Thời gian xử lý
            status: res.statusCode, // Trạng thái HTTP (rất quan trọng!)
            // Bạn có thể ghi thêm res.statusMessage nếu cần
        });
    });

    next();
}

export default httpLogger;