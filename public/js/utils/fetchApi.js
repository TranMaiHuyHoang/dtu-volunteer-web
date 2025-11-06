/**
 * Gọi API với Bearer token hoặc session cookie
 * @param {string} endpoint - '/login', '/register', '/profile'
 * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'
 * @param {object} [data=null] - Dữ liệu gửi đi (JSON)
 * @param {string} [bearerToken=''] - Bearer token
 * @param {object} [options={}] - { useSession: boolean }
 */
async function fetchApi(endpoint, method, data = null, bearerToken = '', options = {}) {
    const url = `${window.location.origin}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    
    if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
    };

    if (options.useSession) {
        config.credentials = 'include';
    }

    const res = await fetch(url, config);

    if (res.ok) {
        return res.json();
    }

    // Xử lý lỗi
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    
    // Token hết hạn → redirect về login
    if (res.status === 401 && errorData.expired) {
        if (typeof saveRedirectURL === 'function') {
            saveRedirectURL(window.location.pathname + window.location.search);
        }
        window.location.href = '/login.html';
        return;
    }
    
    throw new Error(errorData.message || res.statusText || `Lỗi HTTP: ${res.status}`);
}

