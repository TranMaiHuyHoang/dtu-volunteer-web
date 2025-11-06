/**
 * Auth UI - Quản lý header navigation và redirect sau login
 */

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    const path = window.location.pathname;
    // Không cần check auth status ở các trang auth
    if (path.includes('/login') || path.includes('/register') || path.includes('/logout')) {
        return false;
    }
    
    try {
        // Gọi API để kiểm tra auth status (im lặng - không log warning nếu chưa đăng nhập)
        const res = await fetch('/profile', { 
            credentials: 'include',
            // Không throw error khi response không ok (401 là bình thường)
        });
        return res.ok;
    } catch {
        // Lỗi network hoặc lỗi khác - coi như chưa đăng nhập
        return false;
    }
}

// Render header navigation
function renderHeader(isLoggedIn) {
    const nav = document.querySelector('nav[data-nav-container]') || document.querySelector('header nav');
    if (!nav) return;
    
    const commonLinks = `
        <a href="/">Trang chủ</a>
        <a href="/test/test-api.html">Test API</a>
    `;
    
    const authLinks = isLoggedIn
        ? `<a href="/registrations">Đăng ký hoạt động thiện nguyện</a> <a href="/profile/page">Hồ sơ</a> <a href="#" onclick="logout(); return false;">Đăng xuất</a>`
        : `<a href="/login.html">Đăng nhập</a> <a href="/register">Đăng ký</a>`;
    
    nav.innerHTML = commonLinks + authLinks;
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
    return isLoggedIn;
}

// Wrapper functions cho backward compatibility
function showLoggedInUI() {
    renderHeader(true);
    toggleAuthElements(true);
}

function showLoggedOutUI() {
    renderHeader(false);
    toggleAuthElements(false);
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

function redirectAfterLogin(defaultUrl = '/') {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = redirectUrl;
}

