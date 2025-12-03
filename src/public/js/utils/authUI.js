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

    // Không cần check auth ở các trang login/register
    if (isAuthFreePath(path)) {
        return false;
    }

    try {
        const res = await fetch('/auth/status', {
            credentials: 'include',
        });
        return res.ok;
    } catch {
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
            { href: '/list-history', text: 'Lịch sử đăng ký' },
            { href: '/activity-history', text: 'Lịch sử hoạt động' },
            { href: '/profile/page', text: 'Hồ sơ cá nhân' },

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

        clientLog('info', `Header navigation rendered.`);
    } catch (error) {
        clientLog('error', 'LỖI RENDER NAV LINKS: ' + error.message);
    }
}


// Tự động ẩn/hiện phần tử theo trạng thái đăng nhập
function toggleAuthElements(isLoggedIn) {
    document.querySelectorAll('[data-auth-required]').forEach(el => {
        el.style.display = isLoggedIn ? '' : 'none';
    });

    document.querySelectorAll('[data-auth-hidden]').forEach(el => {
        el.style.display = isLoggedIn ? 'none' : '';
    });
}


// Cập nhật UI sau khi đăng nhập / đăng xuất
async function refreshAuthUI() {
    const isLoggedIn = await checkAuthStatus();

    renderHeader(isLoggedIn);
    toggleAuthElements(isLoggedIn);

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
    renderHeader(true);
    toggleAuthElements(true);
}

function showLoggedOutUI() {
    renderHeader(false);
    toggleAuthElements(false);
}


// Lưu URL để redirect sau login
function setRedirectURL(url) {
    if (url) {
        sessionStorage.setItem('redirectAfterLogin', url);
        return;
    }
}

function isReferrerExcluded(referrer) {
    const EXCLUDED_PATHS = ['/login', '/auth/google'];
    return EXCLUDED_PATHS.some(path => referrer.includes(path));
}

function saveRedirectURL(url = null) {
    setRedirectURL(url);

    const referrer = document.referrer;
    const redirectKey = 'redirectAfterLogin';
    const currentRedirect = sessionStorage.getItem(redirectKey);

    if (currentRedirect) return;
    if (!referrer) return;
    if (isReferrerExcluded(referrer)) return;

    try {
        const referrerUrl = new URL(referrer);

        if (referrerUrl.origin !== window.location.origin) return;

        const redirectPath = referrerUrl.pathname + referrerUrl.search;
        sessionStorage.setItem(redirectKey, redirectPath);

    } catch (error) {
        console.warn('Referrer không hợp lệ.');
    }
}


// Xuất ra global
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
