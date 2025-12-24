import { clientLog } from '../utils/clientLogger.js';
import { ensureScriptLoaded } from './dom-utils.js';
//import {refreshAuthUI } from '../utils/authUI.js'; 

/**
 * Gắn sự kiện click cho nút Home và Logo để chuyển hướng về trang chủ ("/").
 * @param {HTMLElement} headerElement - Phần tử header chứa các nút điều hướng.
 */

function bindDashboardAndLogoEvents(headerElement) {
            // Gắn sự kiện cho nút Home để quay về trang chủ
            try {
                const dashboardBtn = headerElement.querySelector('.btn-home');
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
/**
 * 🧩 Helper: Tải nội dung Header từ server và Inject vào DOM.
 * Mục đích: Tách biệt logic tải/inject khỏi luồng chính.
 */
async function injectPartialHeader() {
    const headerElement = document.querySelector('header');
    
    if (!headerElement) {
        clientLog('error', 'Không tìm thấy thẻ <header> để inject nội dung.');
        return false; // Thất bại
    }

    try {
        const res = await fetch('/partials/header.html');
        
        if (!res.ok) {
            clientLog('error', `Lỗi HTTP: ${res.status} khi tải header.`);
            return false; // Thất bại
        }
        
        const headerContent = await res.text();
        
        if (headerContent) {
            headerElement.innerHTML = headerContent;
            // Gắn sự kiện (Giả định hàm này đã tồn tại và hoạt động)
            bindDashboardAndLogoEvents(headerElement); 
            return true; // Thành công
        } else {
            clientLog('error', 'Nội dung header rỗng, không inject.');
            return false; // Thất bại
        }
    } catch (error) {
        // Bắt lỗi mạng hoặc lỗi Fetch
        clientLog('error', 'LỖI LAYOUT: Lỗi khi tải/inject header: ' + error.message);
        return false; // Thất bại
    }
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


/** ----------------------------------------------------
 * 🧠 HÀM CHÍNH: CẬP NHẬT LAYOUT VÀ KHỞI TẠO (MASTER FUNCTION)
 * Mục đích: Điều phối 3 bước: Header, Footer, Scripts.
 * ---------------------------------------------------- */
async function updatePartialsLayout() {
    clientLog('info', 'Bắt đầu cập nhật layout header/footer và scripts.');

    // =======================================================
    // BƯỚC 1: TẢI VÀ INJECT HEADER
    // =======================================================
    const headerSuccess = await injectPartialHeader();
    
    // Nếu Header thất bại, không cần làm gì thêm, dừng lại ngay
    if (!headerSuccess) {
        clientLog('error', 'Quá trình cập nhật layout thất bại do Header không thể tải.');
        return; 
    }

    // =======================================================
    // BƯỚC 2: TẢI VÀ INJECT FOOTER (Có thể bỏ qua lỗi)
    // =======================================================
    // Sử dụng try/catch cục bộ để Footer có lỗi thì vẫn chạy Scripts
    try {
        // Giả định hàm này tồn tại và xử lý logic tải footer
        await loadPartialFooter(); 
    } catch (error) {
        clientLog('error', 'Lỗi (không nghiêm trọng) khi tải partial footer: ' + error.message);
    }

    // =======================================================
    // BƯỚC 3: TẢI VÀ KHỞI TẠO CÁC SCRIPTS
    // =======================================================
    
    // Tải scripts chính (Giả định ensureScriptLoaded có xử lý lỗi bên trong)
    await ensureScriptLoaded('/js/utils/authUi.config.js');
    await ensureScriptLoaded('/js/utils/authUI.js', true); 

    // Cập nhật trạng thái Đăng nhập/Đăng xuất cho toàn bộ giao diện (UI)
    if (typeof window.refreshAuthUI === 'function') {
        try {
            await window.refreshAuthUI();
        } catch (error) {
            clientLog('error', 'Lỗi khi gọi window.refreshAuthUI: ' + error.message);
        }
    }

    // Tải script xác thực cuối cùng
    await ensureScriptLoaded('/js/utils/auth.js', true);

    clientLog('info', 'Quá trình cập nhật layout và khởi tạo scripts đã hoàn thành.');
}



export { updatePartialsLayout };