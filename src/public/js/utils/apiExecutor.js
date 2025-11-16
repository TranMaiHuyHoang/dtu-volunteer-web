
import { showMessage } from './message.js';
import { to } from './promiseHelper.js';

/**
 * Thực thi lời gọi API và xử lý phản hồi (lỗi mạng và lỗi nghiệp vụ).
 * @param {Promise} promise - Promise của lời gọi fetchApi.
 * @param {string} successMessage - Thông báo hiển thị khi thành công.
 * @param {function} successAction - Hành động thực hiện khi thành công (ví dụ: chuyển trang).
 * @returns {object|null} - Trả về data (khi thành công) hoặc null (khi thất bại).
 */
async function executeApiCall(promise, successMessage, successAction) {
    // 1. Bắt lỗi mạng/hệ thống (error)
    const [error, data] = await to(promise);

    if (error) {
        showMessage('Có lỗi xảy ra: ' + error.message, 'error');
        return null;
    }

    // 2. Xử lý thành công về mặt nghiệp vụ
    if (data.status === 'success') {
        showMessage(successMessage, 'success');
        if (successAction) successAction(data);
        return data;
    } 
    
    // 3. Xử lý thất bại về mặt nghiệp vụ
    else {
        const errorMessage = data.message || 'Thao tác thất bại. Vui lòng kiểm tra lại thông tin.';
        showMessage(errorMessage, 'error');
        return null;
    }
}
export { executeApiCall };
