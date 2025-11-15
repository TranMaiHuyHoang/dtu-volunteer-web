/*#logouthandlerfrontend */

/**
 * Logout và redirect về login
 * @param {string} [redirectUrl='/login.html'] - URL redirect sau logout
 */

import {clientLog} from './clientLogger.js';
const logout = function logout(redirectUrl = '/login.html') {
    // Tìm container để hiển thị message
    const containerId = document.getElementById('logout-message') 
        ? 'logout-message' 
        : 'response';
    
    clientLog('info', 'Đang logout, redirect về:', redirectUrl);
    handleLogout(redirectUrl, containerId);
}



/**
 * Gọi API đăng xuất.
 * @returns {Promise<object>} Dữ liệu JSON từ phản hồi.
 * @throws {Error} Nếu fetch thất bại hoặc phản hồi không hợp lệ.
 */
export async function performLogoutRequest() {
    const url = `${window.location.origin}/logout`;
    
    // Sử dụng GET cho yêu cầu đơn giản, mặc dù POST thường được khuyến nghị hơn cho các hành động thay đổi trạng thái
    const options = {
        method: 'GET',
        credentials: 'include'
    };

    const res = await fetch(url, options);
    
    // Giả định API luôn trả về JSON.
    return res.json();
}


/**
 * Chuyển hướng trình duyệt.
 * @param {string} url - URL đích.
 * @param {number} delay - Thời gian chờ (ms).
 */
const redirect = (url, delay = 0) => {
    if (delay > 0) {
        setTimeout(() => window.location.href = url, delay);
    } else {
        window.location.href = url;
    }
};

/**
 * Handle logout and redirect to login page
 * @param {string} redirectUrl - URL to redirect after logout (default: '/login.html')
 * @param {string} containerId - ID of container to show message (default: 'logout-message')
 * 
 * - Show message and redirect after logout
 * - Handle errors if logout failed
 * - Set window.__isLoggingOut to true while handling logout
 * 
 * @example
 * handleLogout('/login.html', 'logout-message');
 */
async function handleLogout(redirectUrl, containerId) {
    window.__isLoggingOut = true;
    
    try {
        const data =  await performLogoutRequest();
        
        // Cập nhật UI
        if (typeof showLoggedOutUI === 'function') {
            showLoggedOutUI();
        }

                // THÊM PARAMETER logout=success VÀO URL
                const urlWithParam = redirectUrl.includes('?') 
                ? `${redirectUrl}&logout=success`
                : `${redirectUrl}?logout=success`;
    
        
        // Hiển thị message và redirect
        if (typeof showMessage === 'function') {
            const message = data.message || 'Đăng xuất thành công';
            clientLog('info', 'Logout successful: ' + message);
            showMessage(message, 'success', containerId);
            redirect(urlWithParam, 1000);
        } else {
            clientLog('info', 'Logout successful, redirecting to:' + redirectUrl);
            window.location.href = urlWithParam;
        }
    } catch (error) {
                // Xử lý lỗi - CŨNG THÊM PARAMETER VÀO URL
                const urlWithParam = redirectUrl.includes('?') 
                ? `${redirectUrl}&logout=success`
                : `${redirectUrl}?logout=success`;

                
        // Xử lý lỗi
        clientLog('error', 'Logout error: ' + error.message);
        if (typeof showLoggedOutUI === 'function') {
            clientLog('error', 'Logout failed: ' + error.message);
            showLoggedOutUI();
        }
        
        if (typeof showMessage === 'function') {
            showMessage('Đã đăng xuất (có thể có lỗi: ' + error.message + ')', 'info', containerId);
            redirect(urlWithParam, 1500);
        } else {
            window.location.href = urlWithParam;
        }
    }
}

/**
 * Handle unauthorized access by redirecting to login page
 * @param {string} [message='Vui lòng đăng nhập để tiếp tục'] - Friendly message to show
 */
// export function handleUnauthorized(message = 'Vui lòng đăng nhập để tiếp tục') {
//     // Save current URL for redirect after login
//     const currentPath = window.location.pathname + window.location.search;
//     const loginUrl = `/login.html?redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent(message)}`;
    
//     // Redirect to login page
//     window.location.href = loginUrl;
// }

export { logout};