/**
 * Promise Helper - Xử lý lỗi Promise một cách ngắn gọn (Server-side)
 * Thay thế try-catch bằng pattern [error, data]
 */

/**
 * Wrap Promise để trả về [error, data] thay vì throw error
 * @param {Promise} promise - Promise cần xử lý
 * @returns {Promise<[Error|null, any]>} - [error, data]
 * 
 * @example
 * const [error, user] = await to(User.findById(id));
 * if (error) {
 *   logger.error(`Lỗi tìm user: ${error.message}`);
 *   return next(error);
 * }
 * // Sử dụng user
 */
async function to(promise) {
    try {
        const data = await promise;
        return [null, data];
    } catch (error) {
        return [error, null];
    }
}

/**
 * Wrap async function để tự động catch và forward error
 * Dùng cho Express route handlers
 * @param {Function} asyncFn - Async function cần wrap
 * @returns {Function} - Express middleware function
 * 
 * @example
 * router.get('/profile', asyncHandler(async (req, res, next) => {
 *   const user = await User.findById(req.user.id);
 *   res.json({ user });
 * }));
 */
function asyncHandler(asyncFn) {
    return (req, res, next) => {
        Promise.resolve(asyncFn(req, res, next)).catch(next);
    };
}

module.exports = { to, asyncHandler };

