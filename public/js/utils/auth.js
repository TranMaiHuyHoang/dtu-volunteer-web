/**
 * Logout và redirect về login
 * @param {string} [redirectUrl='/login.html'] - URL redirect sau logout
 */
function logout(redirectUrl = '/login.html') {
    // Tìm container để hiển thị message
    const containerId = document.getElementById('logout-message') 
        ? 'logout-message' 
        : 'response';
    
    handleLogout(redirectUrl, containerId);
}

/**
 * Xử lý logout: gọi API, cập nhật UI, redirect
 */
async function handleLogout(redirectUrl, containerId) {
    window.__isLoggingOut = true;
    
    try {
        const res = await fetch(`${window.location.origin}/logout`, {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await res.json();
        
        // Cập nhật UI
        if (typeof showLoggedOutUI === 'function') {
            showLoggedOutUI();
        }
        
        // Hiển thị message và redirect
        if (typeof showMessage === 'function') {
            const message = data.message || 'Đăng xuất thành công';
            showMessage(message, 'success', containerId);
            setTimeout(() => window.location.href = redirectUrl, 1000);
        } else {
            window.location.href = redirectUrl;
        }
    } catch (error) {
        // Xử lý lỗi
        if (typeof showLoggedOutUI === 'function') {
            showLoggedOutUI();
        }
        
        if (typeof showMessage === 'function') {
            showMessage('Đã đăng xuất (có thể có lỗi: ' + error.message + ')', 'info', containerId);
            setTimeout(() => window.location.href = redirectUrl, 1500);
        } else {
            window.location.href = redirectUrl;
        }
    }
}

