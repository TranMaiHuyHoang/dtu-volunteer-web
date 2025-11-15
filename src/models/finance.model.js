// Thay thế require bằng import (Thêm đuôi file .js vào đường dẫn tương đối)
import pool from '../config/mysql.js'; 

// Tạo user tài chính mới
async function createFinanceUser(mongoUserId) {
  // pool.query trả về [rows, fields] trong mysql2/promise
  const [result] = await pool.query(
    'INSERT INTO users_finance (mongo_user_id) VALUES (?)',
    [mongoUserId]
  );
  return result.insertId;
}

// Lấy thông tin tài chính người dùng
async function getFinanceUser(mongoUserId) {
  const [rows] = await pool.query(
    'SELECT * FROM users_finance WHERE mongo_user_id = ?',
    [mongoUserId]
  );
  return rows[0];
}

// Ghi giao dịch
async function addTransaction(userId, amount, type, description) {
  // 💡 Mẹo hữu ích: Bạn nên sử dụng Transaction (giao dịch) của MySQL
  // để đảm bảo hai lệnh UPDATE và INSERT này hoặc thành công cả hai, 
  // hoặc thất bại cả hai.

  // 1. Ghi giao dịch
  await pool.query(
    'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
    [userId, amount, type, description]
  );

  // 2. Cập nhật số dư
  await pool.query(
    'UPDATE users_finance SET balance = balance + ? WHERE id = ?',
    [type === 'withdraw' ? -amount : amount, userId]
  );
}

// Giữ nguyên Named Exports ES6
export {
  createFinanceUser,
  getFinanceUser,
  addTransaction,
};