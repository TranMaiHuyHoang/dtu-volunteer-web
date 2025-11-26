// authCookie.js - SỬ DỤNG ESM

// Sử dụng cú pháp import cho dotenv
import 'dotenv/config'; 

/**
 * Utility module để quản lý accessToken cookie
 * Giúp giảm code lặp và đảm bảo nhất quán trong cách set/clear cookie
 */

/**
 * Set accessToken vào HTTP-only cookie
 * @param {object} res - Express response object
 * @param {string} token - JWT access token
 */
const setAccessTokenCookie = (res, token) => {
    res.cookie('accessToken', token, {
        httpOnly: true, // Ngăn JavaScript truy cập (bảo mật)
        // Lưu ý: process.env.NODE_ENV có sẵn sau khi chạy import 'dotenv/config'
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS trong production
        sameSite: 'lax', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // 24 giờ (tương ứng với JWT_EXPIRES_IN)
    });
};

/**
 * Clear accessToken cookie
 * @param {object} res - Express response object
 */
const clearAccessTokenCookie = (res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
};

// Sử dụng Named Export (đã có sẵn và đúng)
export {
    setAccessTokenCookie,
    clearAccessTokenCookie
};