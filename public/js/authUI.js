/**
 * Module quản lý UI trạng thái authentication
 * Tập trung tất cả logic liên quan đến hiển thị/ẩn các element authentication
 * Sử dụng cách render lại thay vì thao tác DOM trực tiếp
 */

/**
 * Kiểm tra trạng thái đăng nhập từ server bằng cách gọi API protected
 * @returns {Promise<boolean>} true nếu đã đăng nhập, false nếu chưa
 */
async function checkAuthStatus() {
    try {
        // Kiểm tra bằng cách gọi API protected, nếu thành công thì đã đăng nhập
        const res = await fetch('/profile', {
            method: 'GET',
            credentials: 'include' // Đảm bảo gửi cookie
        });
        
        return res.ok; // 200 OK = đã đăng nhập, 401/403 = chưa đăng nhập
    } catch (error) {
        console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
        return false;
    }
}

/**
 * Render header dựa trên trạng thái đăng nhập
 * @param {boolean} isLoggedIn - Trạng thái đăng nhập (true: đã đăng nhập, false: chưa đăng nhập)
 */
function renderHeader(isLoggedIn) {
    let navContainer = document.querySelector('nav[data-nav-container]');
    if (!navContainer) {
        // Fallback nếu không tìm thấy container
        navContainer = document.querySelector('header nav');
        if (!navContainer) {
            console.warn('Không tìm thấy nav container để render header');
            return;
        }
    }
    
    // Render các link cố định
    let navHTML = `
        <a href="/">Trang chủ</a>
        <a href="/home.html">Test API</a>
    `;
    
    // Render các link dựa trên trạng thái đăng nhập
    if (isLoggedIn) {
        // Đã đăng nhập: hiển thị Profile và Logout
        navHTML += `
            <a href="/profile">Hồ sơ</a>
            <a href="#" data-action="logout">Đăng xuất</a>
        `;
    } else {
        // Chưa đăng nhập: hiển thị Đăng nhập và Đăng ký
        navHTML += `
            <a href="/login.html">Đăng nhập</a>
            <a href="/register">Đăng ký</a>
        `;
    }
    
    // Render lại toàn bộ nav
    navContainer.innerHTML = navHTML;
}

/**
 * Cập nhật UI dựa trên trạng thái đăng nhập (render lại)
 * @param {boolean} isLoggedIn - Trạng thái đăng nhập (true: đã đăng nhập, false: chưa đăng nhập)
 */
function updateAuthUI(isLoggedIn) {
    renderHeader(isLoggedIn);
    setupEventDelegation();
}

/**
 * Thiết lập Event Delegation cho các action trong header
 * Sử dụng kỹ thuật ủy quyền sự kiện để xử lý event cho các element được render mới
 */
function setupEventDelegation() {
    const navContainer = document.querySelector('nav[data-nav-container]') || document.querySelector('header nav');
    if (!navContainer) return;
    
    // Xóa listener cũ nếu có
    const existingHandler = navContainer._delegationHandler;
    if (existingHandler) {
        navContainer.removeEventListener('click', existingHandler);
    }
    
    // Tạo handler mới
    const delegationHandler = function(event) {
        const target = event.target.closest('a[data-action]');
        if (!target) return;
        
        const action = target.getAttribute('data-action');
        
        switch (action) {
            case 'logout':
                event.preventDefault();
                if (typeof logout === 'function') {
                    logout();
                } else {
                    console.error('Hàm logout() chưa được định nghĩa');
                }
                break;
            default:
                console.warn(`Action không được xử lý: ${action}`);
        }
    };
    
    // Lưu handler để có thể xóa sau này
    navContainer._delegationHandler = delegationHandler;
    
    // Gắn event listener vào container (event delegation)
    navContainer.addEventListener('click', delegationHandler);
}

/**
 * Cập nhật UI từ server (kiểm tra auth status và cập nhật UI)
 */
async function refreshAuthUI() {
    const isLoggedIn = await checkAuthStatus();
    updateAuthUI(isLoggedIn);
    return isLoggedIn;
}

/**
 * Cập nhật UI khi đã đăng nhập thành công
 */
function showLoggedInUI() {
    updateAuthUI(true);
}

/**
 * Cập nhật UI khi đã logout
 */
function showLoggedOutUI() {
    updateAuthUI(false);
}

/**
 * Lưu URL trang trước đó để redirect về sau khi đăng nhập
 * @param {string} url - URL cần lưu (nếu không cung cấp, sẽ lấy từ referrer hoặc current URL)
 */
function saveRedirectURL(url = null) {
    if (url) {
        sessionStorage.setItem('redirectAfterLogin', url);
        return;
    }
    
    // Nếu có referrer và không phải trang login/auth, lưu referrer
    if (document.referrer && 
        !document.referrer.includes('/login') && 
        !document.referrer.includes('/auth/google')) {
        try {
            const referrerUrl = new URL(document.referrer);
            // Chỉ lưu nếu referrer là cùng domain
            if (referrerUrl.origin === window.location.origin) {
                const redirectUrl = referrerUrl.pathname + referrerUrl.search;
                // Chỉ lưu nếu chưa có redirect URL được lưu
                if (!sessionStorage.getItem('redirectAfterLogin')) {
                    sessionStorage.setItem('redirectAfterLogin', redirectUrl);
                }
            }
        } catch (e) {
            // Ignore nếu không parse được URL
        }
    }
}

/**
 * Lấy URL redirect đã lưu và xóa khỏi sessionStorage
 * @param {string} defaultUrl - URL mặc định nếu không có URL được lưu
 * @returns {string} URL để redirect
 */
function getAndClearRedirectURL(defaultUrl = '/home.html') {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || defaultUrl;
    sessionStorage.removeItem('redirectAfterLogin');
    return redirectUrl;
}

/**
 * Redirect về trang cũ sau khi đăng nhập thành công
 * @param {string} defaultUrl - URL mặc định nếu không có URL được lưu
 */
function redirectAfterLogin(defaultUrl = '/home.html') {
    const redirectUrl = getAndClearRedirectURL(defaultUrl);
    window.location.href = redirectUrl;
}

