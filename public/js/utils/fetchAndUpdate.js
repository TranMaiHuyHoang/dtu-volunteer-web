/**
 * Fetch and Update Helper - Utility function để fetch API và tự động update UI
 * 
 * Đây là một high-level helper function kết hợp:
 * - API call (sử dụng fetchApi)
 * - Error handling (sử dụng to() từ promiseHelper)
 * - UI update (sử dụng setElementContent từ fetchHelper)
 * 
 * @example
 * // Đơn giản - GET request với useSession
 * await fetchAndUpdate('/profile', 'profile');
 * 
 * @example
 * // Với formatter tùy chỉnh
 * await fetchAndUpdate('/profile', 'profile', {}, (data) => `User: ${data.username}`);
 * 
 * @example
 * // POST request
 * await fetchAndUpdate('/registrations', 'result', {
 *   method: 'POST',
 *   data: { projectId: '123' },
 *   useSession: true
 * });
 */

/**
 * Fetch API và tự động update element với kết quả
 * @param {string} apiPath - Đường dẫn API (ví dụ: '/profile', '/notifications/me')
 * @param {string} elementId - ID của element cần update
 * @param {object} options - Options cho fetchApi (method, data, bearerToken, useSession)
 * @param {Function} formatter - Function tùy chỉnh để format data trước khi hiển thị (optional)
 * 
 * @example
 * // GET request đơn giản
 * await fetchAndUpdate('/profile', 'profile');
 * 
 * @example
 * // Với formatter tùy chỉnh
 * await fetchAndUpdate('/profile', 'profile', {}, (data) => `User: ${data.username}`);
 * 
 * @example
 * // POST request
 * await fetchAndUpdate('/registrations', 'result', {
 *   method: 'POST',
 *   data: { projectId: '123' },
 *   useSession: true
 * });
 */
async function fetchAndUpdate(apiPath, elementId, options = {}, formatter = null) {
    // Kiểm tra dependencies
    if (typeof to === 'undefined') {
        console.error('fetchAndUpdate: promiseHelper.js chưa được load. Vui lòng load promiseHelper.js trước.');
        if (typeof setElementContent !== 'undefined') {
            setElementContent(elementId, 'Error: promiseHelper.js chưa được load');
        }
        return;
    }

    if (typeof fetchApi === 'undefined') {
        console.error('fetchAndUpdate: fetchApi.js chưa được load. Vui lòng load fetchApi.js trước.');
        if (typeof setElementContent !== 'undefined') {
            setElementContent(elementId, 'Error: fetchApi.js chưa được load');
        }
        return;
    }

    if (typeof setElementContent === 'undefined') {
        console.error('fetchAndUpdate: fetchHelper.js chưa được load. Vui lòng load fetchHelper.js trước.');
        return;
    }

    // Mặc định: GET request với useSession
    const {
        method = 'GET',
        data = null,
        bearerToken = '',
        useSession = true
    } = options;

    // 1. Fetch dữ liệu
    const [error, result] = await to(
        fetchApi(apiPath, method, data, bearerToken, { useSession })
    );

    // 2. Xử lý kết quả
    if (error) {
        setElementContent(elementId, `Error loading ${elementId}: ${error.message}`);
    } else {
        // Sử dụng formatter nếu có, không thì format JSON mặc định
        const content = formatter 
            ? formatter(result) 
            : JSON.stringify(result, null, 2);
        setElementContent(elementId, content);
    }
}

// Export cho cả ES6 modules và script tag thông thường
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchAndUpdate };
}
// Export cho script tag thông thường
if (typeof window !== 'undefined') {
    window.fetchAndUpdate = fetchAndUpdate;
}

