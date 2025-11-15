import { clientLog } from '../utils/clientLogger.js';

/**
 * Đảm bảo các CSS files cần thiết được load
 * CSS files sẽ được load ngay lập tức nếu chưa có trên trang
 * @param {Array<string>} requiredCSS - Danh sách các CSS files cần thiết
 */
function loadMissingStylesheets() {
    const requiredCSS = [
        '/css/message.css',
        '/css/layout.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];
    requiredCSS.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });
}




/**
 * Đảm bảo một script được tải và chờ cho đến khi xong
 * Nếu script đã được tải rồi, hàm sẽ trả về ngay lập tức
 * 
 * @param {string} src - URL của script cần tải
 * @param {boolean} isModule - Có phải là module không (mặc định: false)
 * @returns {Promise<void>} - Promise trả về sau khi script đã được tải xong
 */
async function ensureScriptLoaded(src, isModule = false) {
    const type = isModule ? 'module' : 'script';

    // 1. Kiểm tra xem script đã được tải chưa
    if (document.querySelector(`script[src="${src}"]`)) {
        clientLog('debug', `Bỏ qua tải ${type} (đã có): ${src}`);
        return;
    }

    // 2. Tải và chờ
    const script = document.createElement('script');
    script.src = src;

    // 🔑 Chỉ đặt type="module" khi được yêu cầu
    if (isModule) {
        script.type = 'module';
    } else {
        script.defer = true; // Giữ defer cho script truyền thống (nếu cần)
    }


    return new Promise((resolve, reject) => {

        script.onerror = (event) => {
            const errorMessage = `Lỗi khi tải ${type}: ${src}`;
            clientLog('error', errorMessage);
            // Có thể loại bỏ reject(errorMessage) nếu bạn muốn ứng dụng tiếp tục chạy
            // ngay cả khi 1 script phụ tải thất bại.
            reject(errorMessage);
        };
        script.onload = () => {
            resolve();
        };
        document.body.appendChild(script);

        //clientLog('info', `Đã thêm thẻ ${type} vào DOM: ${src}`);
    });
}

export { loadMissingStylesheets, ensureScriptLoaded };