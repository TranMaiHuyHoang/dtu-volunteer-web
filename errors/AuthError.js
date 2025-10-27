// src/errors/AuthError.js
class AuthError extends Error {
    constructor(message, statusCode = 401) {
        // Gọi constructor của lớp Error
        super(message); 
        
        // Gán mã trạng thái HTTP
        this.statusCode = statusCode;
        
        // Đảm bảo tên lớp là AuthError (quan trọng cho việc kiểm tra lỗi)
        this.name = this.constructor.name; 

        // **Mẹo hữu ích (Tùy chọn):** // Giữ stack trace sạch sẽ (chỉ cần thiết cho Node.js > 8)
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

module.exports = AuthError;