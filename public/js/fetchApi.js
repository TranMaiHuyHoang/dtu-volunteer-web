/**
 * Hàm tiện ích để gọi API (Client-side)
 * @param {string} endpoint - Ví dụ: '/login', '/register', '/profile'
 * @param {string} method - Ví dụ: 'GET', 'POST', 'PUT'
 * @param {object} [data=null] - Dữ liệu gửi đi (JSON body)
 * @param {string} [bearerToken=''] - Token xác thực (Authorization header)
 * @param {object} [options={}] - Tùy chọn bổ sung
 * @param {boolean} [options.useSession=false] - Sử dụng session cookie (credentials: 'include')
 * @returns {Promise<object>} - Response data đã parse JSON
 */
async function fetchApi(endpoint, method, data = null, bearerToken = '', options = {}) {
    const { useSession = false } = options || {};
    const baseUrl = window.location.origin;
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const config = {
        method,
        headers,
        // Chỉ thêm body nếu phương thức là POST/PUT/PATCH và có dữ liệu
        body: data ? JSON.stringify(data) : undefined, 
    };

    // Thêm credentials nếu dùng session
    if (useSession) {
        config.credentials = 'include';
    }

    const res = await fetch(url, config);

    if (res.ok) {
        // Trả về JSON nếu thành công
        return res.json();
    }

    // Xử lý lỗi tập trung: Đọc thông báo lỗi từ body hoặc dùng trạng thái mặc định
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    // Ném ra lỗi để hàm gọi có thể bắt (try...catch)
    throw new Error(errorData.message || res.statusText || `Lỗi HTTP: ${res.status}`);
}

