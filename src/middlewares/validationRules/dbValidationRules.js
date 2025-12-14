// import { param } from 'express-validator';
// import mongoose from 'mongoose'; // <-- Chỉ nhập mongoose ở đây

// const validateIdParam = [
//     // 1. Kiểm tra tham số 'id' có tồn tại không
//     param('id')
//         .notEmpty().withMessage('ID hồ sơ không được để trống trong URL'),
    
//     // 2. Kiểm tra định dạng ID có phải là MongoDB ObjectId hợp lệ không
//     param('id')
//         .custom((value) => {
//             // Sử dụng mongoose.Types.ObjectId.isValid() để kiểm tra định dạng
//             if (!mongoose.Types.ObjectId.isValid(value)) {
//                 throw new Error('ID hồ sơ không hợp lệ. Vui lòng kiểm tra định dạng.');
//             }
//             return true; // Hợp lệ
//         })
// ];

// export {
//     validateIdParam
// };