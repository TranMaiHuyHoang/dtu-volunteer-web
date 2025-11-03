/**
 * Hàm logout đơn giản, tự động tìm container và sử dụng hàm showMessage
 * Tự động tìm container 'logout-message' hoặc 'response'
 * @param {string} redirectUrl - URL để redirect sau khi logout (mặc định: '/login.html')
 */
function logout(redirectUrl = '/login.html') {
    // Tự động tìm container phù hợp
    let containerId = 'response';
    if (document.getElementById('logout-message')) {
        containerId = 'logout-message';
    } else if (document.getElementById('response')) {
        containerId = 'response';
    }
    
    // Kiểm tra xem showMessage có tồn tại không
    if (typeof showMessage === 'function') {
        handleLogout(showMessage, redirectUrl, containerId);
    } else {
        // Nếu không có showMessage, vẫn logout nhưng không hiển thị message
        handleLogout(null, redirectUrl, containerId);
    }
}

/**
 * Hàm xử lý logout có thể tái sử dụng
 * @param {Function} showMessage - Hàm hiển thị thông báo (từ message.js)
 * @param {string} redirectUrl - URL để redirect sau khi logout (mặc định: '/login.html')
 * @param {string} containerId - ID của container để hiển thị message (mặc định: 'response')
 */
async function handleLogout(showMessage = null, redirectUrl = '/login.html', containerId = 'response') {
    const baseUrl = window.location.origin;
    
    try {
        // Gọi API logout
        const res = await fetch(`${baseUrl}/logout`, {
            method: 'GET',
            credentials: 'include' // Đảm bảo gửi session cookie
        });
        
        const data = await res.json();
        
        // Session cookie sẽ tự động bị xóa bởi server khi logout
        // Cập nhật UI để hiển thị trạng thái chưa đăng nhập
        if (typeof showLoggedOutUI === 'function') {
            showLoggedOutUI();
        }
        
        // Hiển thị thông báo nếu có hàm showMessage
        if (showMessage && typeof showMessage === 'function') {
            const message = data.message || 'Đăng xuất thành công';
            showMessage(message, 'success', containerId);
            
            // Đợi một chút để người dùng thấy thông báo
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
        } else {
            // Nếu không có hàm showMessage, redirect ngay
            window.location.href = redirectUrl;
        }
    } catch (error) {
        // Session cookie sẽ tự động bị xóa bởi server khi logout
        // Cập nhật UI để hiển thị trạng thái chưa đăng nhập dù có lỗi
        if (typeof showLoggedOutUI === 'function') {
            showLoggedOutUI();
        }
        
        if (showMessage && typeof showMessage === 'function') {
            showMessage('Đã đăng xuất (có thể có lỗi: ' + error.message + ')', 'info', containerId);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
        } else {
            window.location.href = redirectUrl;
        }
    }
}

