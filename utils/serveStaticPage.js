const path = require('path');

/**
 * Utility function để tạo Express handler serve static HTML files
 * Giúp giảm lặp code khi serve static pages từ thư mục public
 * 
 * @param {string} filename - Tên file HTML trong thư mục public (ví dụ: 'index.html')
 * @returns {function} Express handler function (req, res) => {}
 * 
 * @example
 * // Trong routes file:
 * const { serveStaticPage } = require('../utils/serveStaticPage');
 * router.get("/", serveStaticPage('index.html'));
 * router.get("/login", serveStaticPage('login.html'));
 */
const serveStaticPage = (filename) => {
  return (req, res) => {
    res.sendFile(path.join(__dirname, '../public', filename));
  };
};

module.exports = { serveStaticPage };
