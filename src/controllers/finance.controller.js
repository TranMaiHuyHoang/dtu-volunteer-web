// Thay thế require bằng import (Cần thêm đuôi file .js)
import financeModel from '../models/finance.model.js'; 
// HOẶC: import * as financeModel from '../models/finance.model.js';
// Tùy thuộc vào cách bạn export trong file finance.model.js

/**
 * Lấy thông tin tài chính của người dùng
 * GET /api/finance/:mongoUserId
 */
export const getUserFinance = async (req, res) => {
  try {
    // Lưu ý: Đảm bảo getFinanceUser chấp nhận ID từ req.params.mongoUserId
    const user = await financeModel.getFinanceUser(req.params.mongoUserId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    // Nên sử dụng logger ở đây nếu có
    res.status(500).json({ error: err.message });
  }
};

/**
 * Thêm giao dịch mới
 * POST /api/finance/transaction
 */
export const addTransaction = async (req, res) => {
  try {
    const { userId, amount, type, description } = req.body;
    
    // Lưu ý: Cân nhắc validation input trước khi gọi model
    await financeModel.addTransaction(userId, amount, type, description);
    
    res.json({ message: 'Transaction recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};