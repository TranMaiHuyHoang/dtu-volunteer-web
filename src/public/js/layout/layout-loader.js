import { clientLog } from '../utils/clientLogger.js';
import { ensureScriptLoaded } from './dom-utils.js';
//import {refreshAuthUI } from '../utils/authUI.js'; 

/**
 * Gắn sự kiện click cho nút My Dashboard và Logo để chuyển hướng về trang chủ ("/").
 * @param {HTMLElement} headerElement - Phần tử header chứa các nút điều hướng.
 */

function bindDashboardAndLogoEvents(headerElement) {
            // Gắn sự kiện cho nút My Dashboard để quay về trang chủ
            try {
                const dashboardBtn = headerElement.querySelector('.btn-dashboard');
                if (dashboardBtn) {
                    dashboardBtn.addEventListener('click', () => {
                        window.location.href = '/';
                    });
                }
                // Cho phép click vào logo để về trang chủ (nếu cần)
                const logo = headerElement.querySelector('.logo-section');
                if (logo) {
                    logo.addEventListener('click', () => {
                        window.location.href = '/';
                    });
                }
            } catch (e) {
                clientLog('error', 'Không thể gắn sự kiện header: ' + e.message);
            }
}
/**
 * Cập nhật partials và scripts cho layout.
 * Bao gồm các bước sau:
 * 1. Tải và Inject Header.
 * 2. Tải Footer.
 * 3. Tải và cập nhật scripts.
 * 
 * @returns {Promise<void>} - Promise trả về sau khi cập nhật partials và scripts đã hoàn thành.
 */

async function updatePartialsLayout() {
    clientLog('info', 'Bắt đầu cập nhật partials và scripts.');

    // 1. Tải và Inject Header (Sử dụng hàm helper và chỉ giữ lại log lỗi quan trọng)
    try {
        const headerElement = document.querySelector('header');
        if (!headerElement) {
            clientLog('error', 'Không tìm thấy thẻ <header> để inject nội dung.');
            return;
        }
        const res = await fetch('/partials/header.html');
        if (!res.ok) {
            clientLog('error', `HTTP Error: ${res.status} khi tải header.`);
            throw new Error('Header resource unavailable.');
        }
        
        const headerContent = await res.text();
        
        if (headerElement && headerContent) {
            headerElement.innerHTML = headerContent;
            bindDashboardAndLogoEvents(headerElement);
            // Giữ lại log info để xác nhận inject thành công
            // clientLog('info', `Đã inject header thành công. Chiều dài: ${headerContent.length}`);
        } else {
            clientLog('error', 'Nội dung header rỗng, không inject.');
        }
        
    } catch (error) {
        // Bắt lỗi fetch, lỗi mạng, hoặc lỗi HTTP (4xx, 5xx)
        clientLog('error', 'LỖI LAYOUT: Lỗi khi tải/inject header: ' + error.message);
        return; // Dừng lại nếu phần layout cốt lõi thất bại
    }

    // 2. Tải Footer theo điều kiện (Sử dụng try...catch để tách biệt lỗi)
    try {
        await loadPartialFooter();
    } catch (error) {
        clientLog('error', 'Lỗi khi tải partial footer: ' + error.message);
    }

    // 3. Tải và cập nhật scripts

    // Tải scripts (ensureScriptLoaded có xử lý lỗi bên trong)
    await ensureScriptLoaded('/js/utils/authUi.config.js');
    await ensureScriptLoaded('/js/utils/authUI.js', true);

    // Sử dụng window.refreshAuthUI sau khi đã sửa lỗi scope
    if (typeof window.refreshAuthUI === 'function') {
        try {
            await window.refreshAuthUI();
        } catch (error) {
            clientLog('error', 'Lỗi khi gọi refreshAuthUI: ' + error.message);
        }
    }

    await ensureScriptLoaded('/js/utils/auth.js', true);

    clientLog('info', 'Quá trình cập nhật partials và scripts đã hoàn thành. Bây giờ, ứng dụng đã sẵn sàng để sử dụng.');
}


async function loadPartialFooter() {
    const footerElement = document.querySelector('footer');

    // BƯỚC 1: Kiểm tra ngoại lệ
    const layoutMode = document.body.getAttribute('data-layout-mode');

    // Nếu chế độ là static-footer HOẶC không có thẻ <footer>, thì thoát (trang này đã tự xử lý hoặc không cần footer)
    if (layoutMode === 'static-footer' || !footerElement) {
        return;
    }

    // BƯỚC 2: Tải và chèn footer mặc định
    const footerContent = await fetch('/partials/footer.html').then(res => res.text());

    // Ghi đè nội dung footer (Đã giả định partials là Inner HTML)
    footerElement.innerHTML = footerContent;
    // BƯỚC QUAN TRỌNG: Thêm lớp CSS mặc định
    footerElement.classList.add('default-layout');
}

export { updatePartialsLayout };