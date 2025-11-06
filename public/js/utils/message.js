/**
 * Hàm hiển thị thông báo có thể tái sử dụng
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại thông báo: 'success', 'error', 'info' (mặc định: 'error')
 * @param {string} containerId - ID của container để hiển thị message (mặc định: 'response')
 */
function showMessage(message, type = 'error', containerId = 'response') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container với ID "${containerId}" không tồn tại`);
        return;
    }
    
    // Xóa message cũ nếu có
    container.innerHTML = '';
    
    // Tạo element message mới
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    // Nếu là success message, thêm icon checkmark
    if (type === 'success') {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'message-success-icon';
        iconSpan.textContent = '✓';
        iconSpan.setAttribute('aria-hidden', 'true');
        
        const textSpan = document.createElement('span');
        textSpan.textContent = message;
        textSpan.style.flex = '1';
        
        messageDiv.appendChild(iconSpan);
        messageDiv.appendChild(textSpan);
    } else {
        messageDiv.textContent = message;
    }
    
    container.appendChild(messageDiv);
    
    // Tự động ẩn message sau 5 giây (trừ success vì có thể redirect)
    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
}

