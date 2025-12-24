import { showMessage } from './message.js';
/**
 * Auth UI - Quản lý header navigation và redirect sau login
 */
const DEFAULT_AUTH_FREE_PATHS = ['/login', '/register', '/logout'];
import { logout } from './auth.js';
import { clientLog } from './clientLogger.js';

function getAuthFreePaths() {
    if (window.AUTH_CONFIG && Array.isArray(window.AUTH_CONFIG.authFreePaths)) {
        return window.AUTH_CONFIG.authFreePaths;
    }
    return DEFAULT_AUTH_FREE_PATHS;
}

function isAuthFreePath(pathname) {
    return getAuthFreePaths().some((segment) => pathname.includes(segment));
}


// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    const path = window.location.pathname;
    // Không cần check auth status ở các trang auth
    if (isAuthFreePath(path)) {
        return false;
    }

    try {
        // Gọi API để kiểm tra auth status (im lặng - không log warning nếu chưa đăng nhập)
        const res = await fetch('/auth/status', {
            credentials: 'include',
            // Không throw error khi response không ok (401 là bình thường)
        });
        return res.ok;
    } catch {
        // Lỗi network hoặc lỗi khác - coi như chưa đăng nhập
        return false;
    }
}

function createNavLink({ href = '#', text = '', className = '', onClick = null, attrs = {} } = {}) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = text;

    if (className) link.className = className;
    if (onClick) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            onClick(e);
        });
    }

    for (const [key, value] of Object.entries(attrs)) {
        link.setAttribute(key, value);
    }

    return link;
}



// #headerlinks
function renderHeader(isLoggedIn) {
    clientLog('info', `Rendering header. Logged in: ${isLoggedIn}`);

    const navContainer = document.querySelector('.nav-links[data-nav-container]');

    if (!navContainer) {
        clientLog('error', 'KHÔNG TÌM THẤY NAV CONTAINER. (Header chưa inject)');
        return;
    }

    navContainer.innerHTML = '';

    // =============================
    // 🔥 LINK CHUNG (TIẾNG VIỆT)
    // =============================
    const commonLinks = [
        { href: '/', text: 'Trang chủ' },
        { href: '/about', text: 'Giới thiệu' },
        { href: '/impact', text: 'Tác động cộng đồng' },
    ];

    // =============================
    // 🔥 LINK KHI ĐÃ ĐĂNG NHẬP
    // =============================
    const authLinks = isLoggedIn
        ? [
            { href: '/activities/page', text: 'Hoạt động' },
            // { href: '/list-history', text: 'Lịch sử đăng ký' },
            { href: '/activity-history', text: 'Lịch sử hoạt động' },
            // { href: '/profile/page', text: 'Hồ sơ cá nhân' },
            {
                href: '#',
                text: 'Đăng xuất',
                onClick: () => {
                    logout();
                },
            },
        ]
        : [
            // =============================
            // 🔥 LINK KHI CHƯA ĐĂNG NHẬP
            // =============================
            { href: '/login.html', text: 'Đăng nhập' },
            { href: '/register', text: 'Đăng ký' },
        ];

    const allLinks = [...commonLinks, ...authLinks];

    try {
        allLinks.forEach((item) => {
            const link = createNavLink(item);
            navContainer.appendChild(link);
        });

        clientLog('info', `Header navigation rendered. Logged in: ${isLoggedIn}`); // Giờ log này sẽ chạy

    } catch (error) {
        clientLog('error', 'LỖI RENDERING NAV LINKS: ' + error.message);

    }
}

/**
 * 🔗 Gắn sự kiện Đăng xuất cho TẤT CẢ các phần tử có data-auth-action="logout".
 * 🔥 Yêu cầu HTML: Cần dùng data-auth-action="logout" thay cho class .logout-link
 */
function setupLogoutLinks() {
    document.querySelectorAll('[data-auth-action="logout"]').forEach(logoutEl => {
        // Kỹ thuật clone/replace để loại bỏ listener cũ và gắn listener mới (tránh trùng lặp)
        const newEl = logoutEl.cloneNode(true);
        logoutEl.parentNode.replaceChild(newEl, logoutEl);

        newEl.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); // Gọi hàm đăng xuất chính
        });
    });
}

function updateAuthElements(isLoggedIn) {
    // A. Logic ẩn/hiện (Tự động ẩn/hiện phần tử theo trạng thái đăng nhập)
    document.querySelectorAll('[data-auth-required]').forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });

    document.querySelectorAll('[data-auth-hidden]').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : '';
    });
    
    // B. Logic gắn sự kiện (Chỉ chạy khi đã đăng nhập)
    if (isLoggedIn) {
        setupLogoutLinks(); // Gắn sự kiện Đăng xuất cho tất cả các nút/link liên quan
    }
}


// Cập nhật UI sau khi đăng nhập / đăng xuất
async function refreshAuthUI() {
    const isLoggedIn = await checkAuthStatus();
    
    // Đã XÓA: if (isLoggedIn) { setupLogoutDropdownLink(); }

    renderHeader(isLoggedIn);
    updateAuthElements(isLoggedIn); // 🔥 Thay thế cho toggleDisplayAuth

    if (!isLoggedIn) {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('logout') === 'success') {
            showMessage('Bạn đã đăng xuất thành công.', 'success', 'response');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    clientLog('info', `Auth UI updated. Status: ${isLoggedIn ? 'LoggedIn' : 'LoggedOut'}`);
    return isLoggedIn;
}

// Các hàm hỗ trợ
function showLoggedInUI() {
	clientLog('info', 'Gọi showLoggedInUI() - Buộc hiển thị trạng thái đã đăng nhập.');
    renderHeader(true);
    updateAuthElements(true);
}

function showLoggedOutUI() {
    clientLog('info', 'Gọi showLoggedOutUI() - Buộc hiển thị trạng thái đã đăng xuất.');
    renderHeader(false);
    updateAuthElements(false);
}
/**
 * Lưu một URL cụ thể vào sessionStorage để chuyển hướng sau khi đăng nhập.
 * @param {string} url - Đường dẫn tuyệt đối hoặc tương đối để lưu.
 */
function setRedirectURL(url) {
    if (url) {
        sessionStorage.setItem('redirectAfterLogin', url);
        // console.log(`[Redirect] Đặt thủ công: ${url}`); 
        return;
    }
}


function isReferrerExcluded(referrer) {
    // Định nghĩa các đường dẫn cần loại trừ (dễ bảo trì hơn)
    const EXCLUDED_PATHS = ['/login', '/auth/google'];

    // Kiểm tra xem referrer có chứa bất kỳ đường dẫn loại trừ nào không
    return EXCLUDED_PATHS.some(path => referrer.includes(path));
}

/**
 * Lưu một URL cụ thể vào sessionStorage để chuyển hướng sau khi đăng nhập.
 * Nếu referrer là URL hợp lệ và cùng domain với trang hiện tại, và chưa có redirect được lưu,
 * thì lưu lại referrer vào sessionStorage.
 * @param {string} [url] - Đường dẫn tuyệt đối hoặc tương đối để lưu.
 */
function saveRedirectURL(url = null) {
    setRedirectURL(url);

    const referrer = document.referrer; // Trang mà người dùng đến từ
    const redirectKey = 'redirectAfterLogin'; // Tên khóa lưu trong sessionStorage
    const currentRedirect = sessionStorage.getItem(redirectKey);

    // Thoát nếu đã có giá trị lưu
    if (currentRedirect) {
        console.log('[Redirect] Đã có redirect lưu, không ghi đè:', currentRedirect);
        return;
    }

    // 1. Guard Clause: Thoát nếu KHÔNG CÓ referrer
    if (!referrer) {
        console.log('[Redirect] Không có referrer, không lưu.');
        return;
    }

    // 2. Guard Clause: Thoát nếu referrer BỊ LOẠI TRỪ (đã kiểm tra có referrer ở trên)
    if (isReferrerExcluded(referrer)) {
        console.log('[Redirect] Referrer bị loại trừ, không lưu:', referrer);
        return;
    }

    try {
        const referrerUrl = new URL(referrer);

        const isNotSameDomain = referrerUrl.origin !== window.location.origin;            
        if (isNotSameDomain) {
            console.log('[Redirect] Referrer khác domain, không lưu:', referrer);
            return;
        }
        const redirectPath = referrerUrl.pathname + referrerUrl.search;
        sessionStorage.setItem(redirectKey, redirectPath);

    } catch (error) {
        // Nếu referrer không phải là URL hợp lệ thì bỏ qua
        console.warn('Invalid referrer URL, skipping redirect save.');
    }
}

// function redirectAfterLogin(defaultUrl = '/') {
//     const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
//     sessionStorage.removeItem('redirectAfterLogin');
//     window.location.href = redirectUrl;
// }
<<<<<<< HEAD

=======
>>>>>>> 52203030bb34a7492dc04b587052c8ca74182db4

window.refreshAuthUI = refreshAuthUI;
window.saveRedirectURL = saveRedirectURL;
window.showLoggedInUI = showLoggedInUI;
window.showLoggedOutUI = showLoggedOutUI;
window.setRedirectURL = setRedirectURL;

export {
    refreshAuthUI,
    saveRedirectURL,
    showLoggedInUI,
    showLoggedOutUI,
    setRedirectURL,
};

