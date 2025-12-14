import handleValidationErrors from '../middlewares/validationHandler.middleware.js';
import { logRequestBody, logValidationResult } from '../middlewares/validationDebug.middleware.js';
/**
 * Hàm tiện ích để đóng gói (finalize) các quy tắc validation.
 * Nó nhận vào một mảng các quy tắc và trả về một chuỗi middleware hoàn chỉnh
 * bao gồm cả quy tắc và hàm xử lý lỗi ở cuối.
 * @param {Array<Function>} rules - Mảng các quy tắc validation (từ express-validator).
 * @returns {Array<Function>} - Chuỗi middleware hoàn chỉnh.
 */
export const finalizeValidation = (rules) => {
    if (!Array.isArray(rules)) {
        // Đảm bảo rules luôn là mảng, kể cả khi truyền vào một rule duy nhất
        rules = [rules];
    }
    return [
        // logRequestBody,
        ...rules,
        logValidationResult, // 3. Ghi log các lỗi đã thu thập (nếu có)

        handleValidationErrors, // Thêm middleware xử lý lỗi vào cuối,
    ];
};