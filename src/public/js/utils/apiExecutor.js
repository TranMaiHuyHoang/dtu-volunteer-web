
import { showMessage } from './message.js';
import { to } from './promiseHelper.js';

/**
 * Thực thi lời gọi API và xử lý phản hồi (lỗi mạng và lỗi nghiệp vụ).
 * @param {Promise} promise - Promise của lời gọi fetchApi.
 * @param {string} successMessage - Thông báo hiển thị khi thành công.
 * @param {function} successAction - Hành động thực hiện khi thành công (ví dụ: chuyển trang).
 * @returns {object|null} - Trả về data (khi thành công) hoặc null (khi thất bại).
 */
async function executeApiCall(promise, successAction, successMessage = '') {
    // 1. Bắt lỗi mạng/hệ thống (error)
    const [error, data] = await to(promise);
    if (error) {
        // error lúc này có thể là:
        // - Lỗi mạng (Network Error)
        // - Lỗi HTTP 4xx/5xx (ví dụ: 'Lỗi HTTP 401: Token expired')
        const errorMessage = error.message || 'Lỗi không xác định đã xảy ra.';
        showMessage('Có lỗi xảy ra: ' + errorMessage, 'error');
        return null;
    }

    // 2. Xử lý thành công về mặt nghiệp vụ
    // Không cần kiểm tra data.status === 'success' vì nếu không có lỗi,
    // thì HTTP Status phải là 2xx, tức là thành công theo tiêu chuẩn.
    
    // Sử dụng successMessage tùy chọn nếu có, hoặc dùng data.message từ server
    const serverMessage = successMessage || data.message || 'Thao tác thành công.';
    showMessage(serverMessage, 'success');
    
    if (successAction) successAction(data);
}
export { executeApiCall };
