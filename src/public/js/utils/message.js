// #messagefrontned
import { clientLog } from './clientLogger.js';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

let notifyInstance;

function initNotify() {
    // Bạn có thể không cần kiểm tra `window.Notyf` nếu Notyf đã được import
    if (!notifyInstance) { 
        notifyInstance = new Notyf({
            duration: 5000,
            position: { x: 'right', y: 'top' },
            dismissible: true,
            // *** THÊM CẤU HÌNH CHO TYPE 'info' ***
            types: [
                // Loại Info (thường dùng màu xanh dương)
                {
                    type: 'info', 
                    background: '#2196F3', // Màu xanh dương chuẩn
                },
                // Bạn cũng nên định nghĩa lại 'warning'
                { 
                    type: 'warning', 
                    background: '#FFC107', // Màu vàng cảnh báo
                    icon: false 
                },
            ]
        });
    }
}

// Nếu bạn muốn sử dụng Notyf này ở nơi khác, hãy export nó
export function getNotyf() {
    initNotify();
    return notifyInstance;
}


// Hàm chính để hiển thị thông báo
function showMessage(message, type = 'error') {
    try {
        const notify = getNotyf();
        
        // Ghi log
        clientLog('info', `[${type.toUpperCase()}] ${message}`);
        
        // Hiển thị thông báo theo loại
        switch(type.toLowerCase()) {
            case 'success':
                notify.success(message);
                break;
            case 'warning':
                notify.error({ 
                    message: message,
                    type: 'warning'
                });
                break;
            case 'info':
                notify.success({ 
                    message: message,
                    type: 'info'
                });
                break;
            case 'error':
            default:
                notify.error(message);
        }
    } catch (error) {
        console.error('Lỗi khi hiển thị thông báo:', error);
        // Fallback sử dụng alert nếu có lỗi
        window.alert(`[${type}] ${message}`);
    }
}

// Xuất hàm ra global
// window.showMessage = showMessage;

export { showMessage };

