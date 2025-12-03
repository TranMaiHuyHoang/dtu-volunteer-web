import { nameRules, emailRules, phoneRules, addressRules, notesRules, validateIdParam } from './baseRulesValidate.js';

const createRecordValidator = [
    // Name và Email BẮT BUỘC (áp dụng thêm notEmpty() vào base rule)
    ...nameRules.map(rule => rule.notEmpty().withMessage('Tên không được để trống')),
    ...emailRules.map(rule => rule.notEmpty().withMessage('Email không được để trống')),
    
    // Các trường còn lại đã có optional() trong base rule, chỉ cần spread
    ...phoneRules, 
    ...addressRules, 
    ...notesRules,
    
];

// --- 2. Validator cho CẬP NHẬT (PUT) ---
const updateRecordValidator = [
    // Name và Email TÙY CHỌN (áp dụng optional() vì chúng không bắt buộc khi cập nhật)
    ...nameRules.map(rule => rule.optional()), 
    ...emailRules.map(rule => rule.optional()),
    
    // Các trường còn lại đã có optional() trong base rule, chỉ cần spread
    ...phoneRules, 
    ...addressRules, 
    ...notesRules,
    
];

export {createRecordValidator, updateRecordValidator, validateIdParam};