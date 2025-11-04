/**
 * Auth UI - Quản lý header navigation và redirect sau login
 */

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    const path = window.location.pathname;
    if (path.includes('/login') || path.includes('/register') || path.includes('/logout')) {
        return false;
    }
    
    try {
        const res = await fetch('/profile', { credentials: 'include' });
        return res.ok;
    } catch {
        return false;
    }
}

// Render header navigation
function renderHeader(isLoggedIn) {
    const nav = document.querySelector('nav[data-nav-container]') || document.querySelector('header nav');
    if (!nav) return;
    
    const commonLinks = `
        <a href="/">Trang chủ</a>
        <a href="/home.html">Test API</a>
    `;
    
    const authLinks = isLoggedIn
        ? `<a href="/profile">Hồ sơ</a> <a href="#" onclick="logout(); return false;">Đăng xuất</a>`
        : `<a href="/login.html">Đăng nhập</a> <a href="/register">Đăng ký</a>`;
    
    nav.innerHTML = commonLinks + authLinks;
}

// Cập nhật UI dựa trên trạng thái đăng nhập
async function refreshAuthUI() {
    const isLoggedIn = await checkAuthStatus();
    renderHeader(isLoggedIn);
    return isLoggedIn;
}

// Wrapper functions cho backward compatibility
function showLoggedInUI() {
    renderHeader(true);
}

function showLoggedOutUI() {
    renderHeader(false);
}

// Redirect sau login - Lưu và khôi phục URL trang trước đó
function saveRedirectURL(url = null) {
    if (url) {
        sessionStorage.setItem('redirectAfterLogin', url);
        return;
    }
    
    // Tự động lấy từ referrer nếu cùng domain và không phải trang auth
    if (document.referrer && 
        !document.referrer.includes('/login') && 
        !document.referrer.includes('/auth/google')) {
        try {
            const referrerUrl = new URL(document.referrer);
            if (referrerUrl.origin === window.location.origin && 
                !sessionStorage.getItem('redirectAfterLogin')) {
                sessionStorage.setItem('redirectAfterLogin', referrerUrl.pathname + referrerUrl.search);
            }
        } catch (e) {
            // Ignore invalid URL
        }
    }
}

function redirectAfterLogin(defaultUrl = '/home.html') {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectUrl;
}

