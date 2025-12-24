// 1. IMPORT TẤT CẢ CÁC DEPENDENCIES TỪ CÁC FILES KHÁC
// Lưu ý: Cần biết chính xác cách các file kia export (default hay named)
// Giả sử:
// - to() là named export từ promiseHelper
// - fetchApi() là named export từ fetchApi
// - setElementContent() là named export từ fetchHelper

import { to } from './promiseHelper.js'; 
import { fetchApi } from './fetchApi.js'; 
import { setElementContent } from './fetchHelper.js';

/**
 * Fetch API và tự động update element với kết quả
 * @param {string} apiPath - Đường dẫn API (ví dụ: '/profile', '/notifications/me')
 * @param {string} elementId - ID của element cần update
 * @param {object} options - Options cho fetchApi (method, data, bearerToken, useSession)
 * @param {Function} formatter - Function tùy chỉnh để format data trước khi hiển thị (optional)
 */
async function fetchAndUpdate(apiPath, elementId, options = {}, formatter = null) {
    // 💡 GỠ BỎ TẤT CẢ KHỐI KIỂM TRA typeof === 'undefined' 
    // vì khi sử dụng import, các dependencies luôn có sẵn hoặc gây lỗi syntax ngay lập tức.
    
    // Mặc định: GET request với useSession
    const {
        method = 'GET',
        data = null,
        bearerToken = '',
        useSession = true
    } = options;

    // 1. Fetch dữ liệu
    const [error, result] = await to(
        fetchApi(apiPath, method, data, { useSession, bearerToken })
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

// 3. Export hàm duy nhất
export { fetchAndUpdate };