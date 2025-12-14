import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    const firstErrorMessage = errorArray[0].msg;

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      // 'Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại các trường đã nhập.',
      errors: errors.mapped()
    });
  }
  
  next();
};
// const handleValidationErrors = (req, res, next) => {
//     const errors = validationResult(req);
    
//     if (!errors.isEmpty()) {
//         // ✨ LẤY DANH SÁCH LỖI (SỬ DỤNG .array() HOẶC .mapped())
//         const errorDetails = errors.array().map(err => ({
//             // Trả về tên trường bị lỗi
//             field: err.path, 
//             // Trả về thông báo lỗi cụ thể
//             message: err.msg, 
//             // Có thể thêm value để debug
//             value: err.value 
//         }));
//         console.log('[DEBUG TẠM VALIDATION ERRORS]', errorDetails);
//         // Trả về JSON chứa chi tiết các lỗi
//         return res.status(400).json({ 
//             status: 'error',
//             message: 'Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại các trường.',
//             // ✨ CHÈN CHI TIẾT LỖI
//             errors: errorDetails 
//         });
//     }
    
//     next(); 
// };
export default handleValidationErrors;

