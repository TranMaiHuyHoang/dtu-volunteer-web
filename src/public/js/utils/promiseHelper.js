/**
 * Promise Helper - Xử lý lỗi Promise một cách ngắn gọn
 * Thay thế try-catch bằng pattern [error, data]
 */

/**
 * Wrap Promise để trả về [error, data] thay vì throw error
 * @param {Promise} promise - Promise cần xử lý
 * @returns {Promise<[Error|null, any]>} - [error, data]
 * 
 * @example
 * // Thay vì:
 * try {
 *   const data = await fetchApi('/profile', 'GET');
 *   // sử dụng data
 * } catch (error) {
 *   // xử lý lỗi
 * }
 * 
 * // Dùng:
 * const [error, data] = await to(fetchApi('/profile', 'GET'));
 * if (error) {
 *   showMessage(error.message, 'error');
 *   return;
 * }
 * // Sử dụng data
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
 * Wrap async function để tự động catch và xử lý lỗi
 * @param {Function} asyncFn - Async function cần wrap
 * @param {Function} errorHandler - Function xử lý lỗi (optional)
 * @returns {Function} - Wrapped function
 * 
 * @example
 * const safeLoadData = handleAsync(async () => {
 *   const data = await fetchApi('/profile', 'GET');
 *   return data;
 * }, (error) => showMessage(error.message, 'error'));
 */
function handleAsync(asyncFn, errorHandler = null) {
    return async (...args) => {
        const [error, data] = await to(asyncFn(...args));
        if (error && errorHandler) {
            errorHandler(error);
        }
        return [error, data];
    };
}

if (typeof window !== 'undefined') {
    window.to = to;
    window.handleAsync = handleAsync;
}

export {to, handleAsync};