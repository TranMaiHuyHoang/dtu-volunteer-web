import { validationResult } from "express-validator";
// Middleware để kiểm tra body trước khi validation

const logRequestBody = (req, res, next) => {
    console.log('--- VALIDATION DEBUG START ---');
    console.log('[Body Data]', req.body);
    next();
};

// Middleware để kiểm tra kết quả validation (trước khi xử lý lỗi)
const logValidationResult = (req, res, next) => {
    // Lưu ý: Hàm validationResult cần được import từ express-validator
    
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        console.error('[Validation Errors Found]', errors.array());
    } else {
        console.log('[Validation Status] SUCCESS (No errors collected)');
    }
    console.log('--- VALIDATION DEBUG END ---');
    next();
};

export { logRequestBody, logValidationResult };