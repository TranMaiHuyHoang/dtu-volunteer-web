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

/**
 * Ánh xạ cấp độ log không chuẩn (như 'success') sang cấp độ chuẩn (như 'info') 
 * trước khi gọi clientLog để tránh lỗi 'Unknown logger level' trên server.
 * * @param {string} type - Cấp độ log ban đầu ('success', 'error', 'info', v.v.).
 * @param {string} message - Nội dung thông báo.
 */
function safeClientLog(type, message) {
    let messageType = type.toLowerCase();
    
    // Ánh xạ 'success' thành 'info' cho Server Log (Winston)
    if (messageType === 'success') {
        messageType = 'info';
    }
    
    // Ghi Log
    clientLog(messageType, message);
}

// Hàm chính để hiển thị thông báo //type = 'error'
function showMessage(message, type = 'info') {
    try {
        const notify = getNotyf();
        
        // Ghi log
        //Test:        //--
        safeClientLog(type, message);
        clientLog('info', `Hiển thị thông báo [${type}]: ${message}`);
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

