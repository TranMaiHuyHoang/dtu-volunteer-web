import axios from 'axios';
import urlConfig from '@/config/urlConfig.js';

console.log('[DEBUG-IMPORT] urlConfig:', urlConfig); 
console.log('[DEBUG-BASE_URL] Giá trị mong đợi:', urlConfig.baseUrl); 
// ----------------

async function requestApi(method, path, data = {}, headers = {}) {
  const base = urlConfig.baseUrl.endsWith('/') ? urlConfig.baseUrl.slice(0, -1) : urlConfig.baseUrl; 
  const cleanPath = path.startsWith('/') ? path : `/${path}`; 
  const fullUrl = `${base}${cleanPath}`;
  
  console.log(`[TEST DEBUG] Gọi API: ${method} ${fullUrl}`);
  
  try {
    const response = await axios({
      method: method,
      url: fullUrl,
      data: data,
      headers: headers,
      // 💡 Cải thiện: Đảm bảo Axios không tự động ném lỗi cho 4xx/5xx để bạn có thể bắt chúng qua response
            validateStatus: function (status) {
                return status >= 200 && status < 600; // Cho phép tất cả các mã trạng thái
            },

    });
    
    // ✅ TRẢ VỀ NGUYÊN BẢN - GIỮ NGUYÊN CẤU TRÚC
    return response;
    
  } catch (error) {
    // Lỗi này xảy ra khi Axios không thể gửi yêu cầu (Network/DNS/CORS)
        if (error.response) {
            // Đây là lỗi 4xx/5xx mà Axios đã ném, nhưng vì ta dùng validateStatus: () => true, 
            // nó thường chỉ bắt lỗi network. Tuy nhiên, nếu error.response tồn tại, đó là lỗi API.
            return error.response; 
        }
    
    console.error(`[LỖI TEST NETWORK] Không thể kết nối tới server tại ${fullUrl}`);
    
      return {
            status: 503, 
            headers: {},
            // 💡 Cải thiện: Thông tin rõ ràng hơn về lỗi mạng
            data: { 
                status: 'error',
                message: 'Lỗi kết nối hoặc server không khả dụng.', 
                error_details: error.message,
                isNetworkError: true 
            }
        };
  }
}

export { requestApi };