// ./test/setup.js

import mongoose from 'mongoose';
import 'dotenv/config'; // Đảm bảo các biến môi trường được tải

// Giả định bạn có biến môi trường cho Database Test
const MONGO_URL = process.env.MONGO_URL 
// Hàm chạy trước khi tất cả các test suite bắt đầu
beforeAll(async () => {
  try {
    console.log('Đang kết nối tới MongoDB Test...');
    await mongoose.connect(MONGO_URL);
    console.log('Kết nối thành công.');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1); // Thoát nếu không kết nối được
  }
});

// Hàm chạy sau khi tất cả các test suite đã hoàn thành
afterAll(async () => {
  try {
    // Dọn dẹp dữ liệu test trong Database (tuỳ chọn)
    // Ví dụ: Xoá tất cả dữ liệu từ collection 'studentprofiles'
    // await mongoose.connection.db.dropCollection('studentprofiles'); 

    console.log('Đang ngắt kết nối MongoDB...');
    await mongoose.connection.close();
    console.log('Đã ngắt kết nối.');
  } catch (error) {
    console.error('Lỗi khi ngắt kết nối MongoDB:', error);
  }
});

// Tùy chọn: Hàm chạy trước mỗi test, dùng để dọn dẹp dữ liệu giữa các test
// beforeEach(async () => {
//     // Đảm bảo Database sạch trước mỗi test
// });