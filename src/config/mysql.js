// Thay thế require bằng import
import mysql from 'mysql2/promise';
// Tải biến môi trường: dùng import 'dotenv/config'; 
// hoặc đảm bảo đã tải ở file khởi động chính (app.js/server.js)
import 'dotenv/config'; 

// Tạm thời comment để tránh lỗi kết nối MySQL
// Sẽ bật lại sau khi cấu hình MySQL đúng
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DB || 'volunteer_finance',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Tạm thời comment phần tự động kết nối
/*
pool.getConnection()
  .then(() => console.log('✅ Connected to MySQL'))
  .catch(err => console.error('❌ MySQL connection error:', err));
*/

// Thay thế module.exports = pool; bằng export default pool;
export default pool;