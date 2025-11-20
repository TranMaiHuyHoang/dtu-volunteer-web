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
        clientLog('error', 'KHÔNG TÌM THẤY NAV CONTAINER. (Header inject chưa hoàn thành?)');
        return;
    }

    // Xóa nội dung cũ
    navContainer.innerHTML = '';

    // Danh sách link chung
    const commonLinks = [
        { href: '/', text: 'Home page' },
        {
            href: '/about',
            text: 'About',
            // onClick: () => {
            //     window.location.href = '/about';
            // }
        },
        {
            href: '/impact',
            text: 'Our Impact',

        },
    ];

    // Link tùy theo trạng thái đăng nhập
    const authLinks = isLoggedIn
        ? [
            { href: '/activities', text: 'Activities' },
            { href: '/list-history', text: 'List History' },
            { href: '/activity-history', text: 'Activity History' },
            { href: '/profile/page', text: 'Profile' },

            {
                href: '#',
                text: 'Logout',
                onClick: () => {
                    logout();
                },
            },
        ]
        : [
            { href: '/login.html', text: 'Login' },
            { href: '/register', text: 'Register' },
        ];

    // Gộp mảng link
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


// Tự động ẩn/hiện các phần tử dựa trên trạng thái đăng nhập
// Sử dụng data attributes: data-auth-required (chỉ hiển thị khi đã đăng nhập)
// và data-auth-hidden (chỉ hiển thị khi chưa đăng nhập)
function toggleAuthElements(isLoggedIn) {
    // Ẩn/hiện các phần tử yêu cầu đăng nhập
    document.querySelectorAll('[data-auth-required]').forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });

    // Ẩn/hiện các phần tử chỉ hiển thị khi chưa đăng nhập
    document.querySelectorAll('[data-auth-hidden]').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : '';
    });
}

// Cập nhật UI dựa trên trạng thái đăng nhập
async function refreshAuthUI() {
    const isLoggedIn = await checkAuthStatus();
    renderHeader(isLoggedIn);
    toggleAuthElements(isLoggedIn);
    if (isLoggedIn === false) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('logout') === 'success') {
            showMessage('Bạn đã đăng xuất thành công.', 'success', 'response');
            // Xóa tham số khỏi URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    // if (isLoggedIn === false) { 
    //     // Giả sử có một cơ chế để kiểm tra xem đây có phải là kết quả của LỆNH đăng xuất KHÔNG
    //     // Nếu không, thông báo này sẽ xuất hiện trên mọi trang đã đăng xuất.
    //     // Cần thêm logic kiểm tra "flash message" hoặc tham số URL.

    //     // TẠM THỜI: Gọi showMessage trực tiếp nếu nó là kết quả của hành động Đăng xuất.
    //     // PHẢI ĐẢM BẢO CHỈ GỌI MỘT LẦN VÀ CHỈ KHI CẦN.
    //     showMessage('Bạn đã đăng xuất thành công.', 'success', 'response');
    // }

    clientLog('info', `Auth UI updated. Status: ${isLoggedIn ? 'LoggedIn' : 'LoggedOut'}`); // GIỮ LOG KẾT THÚC VỚI TRẠNG THÁI
    return isLoggedIn;
}

// Wrapper functions cho backward compatibility
function showLoggedInUI() {
    clientLog('info', 'Gọi showLoggedInUI() - Buộc hiển thị trạng thái đã đăng nhập.');
    renderHeader(true);
    toggleAuthElements(true);
}

function showLoggedOutUI() {
    clientLog('info', 'Gọi showLoggedOutUI() - Buộc hiển thị trạng thái đã đăng xuất.');
    renderHeader(false);
    toggleAuthElements(false);
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

function redirectAfterLogin(defaultUrl = '/') {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectUrl;
}


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

