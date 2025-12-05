/**
 * Đảm bảo CSS cần thiết được load
 */
import { clientLog } from './utils/clientLogger.js';
import { loadMissingStylesheets } from './layout/dom-utils.js';
import { setupPageLayoutElements } from './layout/layout-creator.js';
import { updatePartialsLayout } from './layout/layout-loader.js';


/** -----------------------------------------
 * 2. LOGIC RIÊNG BIỆT (Separation of Concerns)
 * ------------------------------------------ */

/**
 * Khởi tạo menu thả xuống cho các hành động của người dùng (user actions dropdown)
 */
function setupUserActionsDropdown() {
    const toggleButton = document.querySelector('.menu-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu[data-menu-id="user-actions"]'); 

    if (!toggleButton || !dropdownMenu) {
        // Chỉ ghi log error nếu phần tử cần thiết cho logic này bị thiếu
        clientLog('error', 'Dropdown setup: Thiếu nút toggle hoặc dropdown.');
        return;
    }

    // Đảm bảo trạng thái đóng ban đầu
    dropdownMenu.classList.remove('is-open'); 

    toggleButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('is-open'); 
        clientLog('info', 'Trạng thái dropdown: ' + dropdownMenu.classList.contains('is-open'));
    });
}
// =================================================================

/**
 * Load và cập nhật header/footer từ partials
 * Đơn giản: chỉ load nội dung và inject vào tags có sẵn trong HTML
 */
async function loadLayout() {
    //clientLog('info', 'Loading layout partials...');
    setupPageLayoutElements();
    await updatePartialsLayout();
    // =================================================================
    // 2. GỌI HÀM MỚI SAU KHI LAYOUT ĐÃ TẢI XONG
    // =================================================================
    setupUserActionsDropdown();
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