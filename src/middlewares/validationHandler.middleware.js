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

export default handleValidationErrors;

