// src/utils/serveStaticPage.js

import { join, dirname } from 'path';
import { fileURLToPath } from 'url'; // <--- CẦN THÊM DÒNG NÀY

/**
 * Tính toán __dirname tương đương trong môi trường ES Module
 * import.meta.url: 'file:///E:/code/dtu-volunteer-web/src/utils/serveStaticPage.js'
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename); // <--- ĐỊNH NGHĨA __dirname Ở ĐÂY

/**
 * Utility function để tạo Express handler serve static HTML files
 * Giúp giảm lặp code khi serve static pages từ thư mục public
 * * @param {string} filename - Tên file HTML trong thư mục public (ví dụ: 'index.html')
 * @returns {function} Express handler function (req, res) => {}
 */
const serveStaticPage = (filename) => {
  return (req, res) => {
    // Sử dụng __dirname đã được định nghĩa ở trên
    res.sendFile(join(__dirname, '../public', filename)); 
  };
};

export default serveStaticPage;