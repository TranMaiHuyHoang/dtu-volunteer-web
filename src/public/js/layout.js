/**
 * Đảm bảo CSS cần thiết được load
 */
import { clientLog } from './utils/clientLogger.js';
import { loadMissingStylesheets } from './layout/dom-utils.js';
import { setupPageLayoutElements } from './layout/layout-creator.js';
import { updatePartialsLayout } from './layout/layout-loader.js';



/**
 * Load và cập nhật header/footer từ partials
 * Đơn giản: chỉ load nội dung và inject vào tags có sẵn trong HTML
 */
async function loadLayout() {
    //clientLog('info', 'Loading layout partials...');
    setupPageLayoutElements();
    await updatePartialsLayout();
}

// Khởi tạo layout sau khi message.js load xong
function initLayout() {
    loadMissingStylesheets();

    // Nếu DOM đã sẵn sàng, load ngay; nếu chưa, đợi DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLayout);
    } else {
        loadLayout();
    }
}

// // Load message.js nếu chưa có (phải load trước layout.js)
// (function () {
//     if (typeof showMessage !== 'undefined') {
//         // message.js đã có, tiếp tục
//         initLayout();
//         return;
//     }

//     const script = document.createElement('script');
//     // Load message.js
//     script.src = '/js/utils/message.js';
//     script.type = 'module';
//     script.onload = initLayout;
//     document.head.appendChild(script);
// })();

initLayout();