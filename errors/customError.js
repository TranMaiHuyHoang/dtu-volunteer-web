class CustomError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        // Đảm bảo tên lỗi chính xác
        this.name = this.constructor.name; 
        // Bắt stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}


class NotFoundError extends CustomError {
    constructor(message = 'Tài nguyên không tồn tại') {
        super(message, 404);
    }
}

class ConflictError extends CustomError {
    constructor(message = 'Dữ liệu bị trùng lặp') {
        super(message, 409);
    }
}

class BadRequestError extends CustomError {
    constructor(message = 'Yêu cầu không hợp lệ') {
        super(message, 400);
    }
}
module.exports = { CustomError, NotFoundError, ConflictError, BadRequestError };