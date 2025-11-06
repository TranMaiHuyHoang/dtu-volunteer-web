const pool = require('../config/mysql');

// Tạo user tài chính mới
async function createFinanceUser(mongoUserId) {
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
  await pool.query(
    'INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
    [userId, amount, type, description]
  );
  await pool.query(
    'UPDATE users_finance SET balance = balance + ? WHERE id = ?',
    [type === 'withdraw' ? -amount : amount, userId]
  );
}

module.exports = {
  createFinanceUser,
  getFinanceUser,
  addTransaction,
};
