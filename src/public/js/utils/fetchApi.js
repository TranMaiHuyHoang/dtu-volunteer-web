import { ApiError } from '../../../errors/ApiError.js';
import { clientLog } from './clientLogger.js';


/**
 * Gọi API với Bearer token hoặc session cookie
 * @param {string} endpoint - '/login', '/register', '/profile' hoặc '/api/login'
 * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} [data=null] - Dữ liệu gửi đi (JSON)
 * @param {string} [bearerToken=''] - Bearer token
 * @param {object} [options={}] - { useSession: boolean }
 */

function handleTokenExpiration(res, errorData) {
    // 1. Kiểm tra mã HTTP 401 và cờ 'expired'
    if (res.status === 401 && errorData?.expired === true) {
        console.log("Token hết hạn. Chuyển hướng để đăng nhập lại.", errorData);
        
        // 2. Lưu URL hiện tại để chuyển hướng lại sau khi đăng nhập
        if (typeof saveRedirectURL === 'function') {
            saveRedirectURL(window.location.pathname + window.location.search);
        }
        
        // 3. Chuyển hướng đến trang đăng nhập
        window.location.href = '/login.html';
        
        return true; // Báo hiệu đã xử lý và cần dừng xử lý lỗi tiếp theo
    }
    
    return false; // Không phải lỗi hết hạn token
}


async function fetchApi(endpoint, method, data = null, // Tường minh hóa options bằng Destructuring và giá trị mặc định
    { 
        useSession = false, // Mặc định KHÔNG sử dụng Session Cookie
        bearerToken = ''    // Mặc định KHÔNG có Bearer Token
    } = {}, 
) {
    // Vite tự động handle relative URLs
    const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const headers = { 'Content-Type': 'application/json' };
    
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    };

    if (useSession) {
        config.credentials = 'include';
    }
    
    const res = await fetch(url, config);

    if (res.ok) {
        console.log("Response ok", res);
        return res.json();
    }

    // Xử lý lỗi
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    console.log("Error data", errorData);
    
    // Token hết hạn → redirect về login
    if (handleTokenExpiration(res, errorData)) {
        throw new Error('Token expired or unauthorized action handled.'); // Ném một lỗi để to() bắt được
    }
        clientLog('error', `API ERROR: ${res.status} - ${errorData.message || res.statusText}`);

    throw new ApiError( 
        res.status, 
        errorData.message || res.statusText || `Lỗi HTTP: ${res.status}`,
        errorData 
    );
}

// Hỗ trợ cả classic script và ES module
try {
    if (typeof window !== 'undefined') {
        window.fetchApi = window.fetchApi || fetchApi;
    }
} catch {}

export { fetchApi };
export default fetchApi;