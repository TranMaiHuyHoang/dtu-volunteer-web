// api.test.js

// 1. IMPORT CẦN THIẾT
//import { fetchApi } from '../src/public/js/utils/fetchApi.js'; // Thay đổi đường dẫn đến file gốc
import fetchMock from 'jest-fetch-mock'; // Hoặc vitest-fetch-mock

// Bật chế độ mock cho fetch
fetchMock.enableMocks();

// 2. KHỐI DESCRIBE CHÍNH
describe('fetchApi', () => {
  // 3. CLEANUP/SETUP TRƯỚC MỖI TEST
  // Đảm bảo fetch mock được reset trước mỗi it()
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  // --- KHỐI 1: KIỂM THỬ THÀNH CÔNG (SUCCESS CASES) ---
  describe('✅ Trường hợp thành công (Status 200/201)', () => {
    it('Nên gọi GET request và trả về dữ liệu JSON', async () => {
      // Logic test thành công
    });
    
    it('Nên áp dụng Bearer token và body cho POST request', async () => {
      // Logic test POST
    });
    
    it('Nên thêm credentials: "include" khi dùng useSession', async () => {
      // Logic test session
    });
  });

  // --- KHỐI 2: KIỂM THỬ XỬ LÝ LỖI CHUNG (ERROR CASES) ---
  describe('❌ Trường hợp lỗi HTTP chung (4xx/5xx)', () => {
    it('Nên ném lỗi với thông báo từ body JSON', async () => {
      // Logic test 400
    });
    
    it('Nên ném lỗi với res.statusText nếu body JSON bị lỗi/trống', async () => {
      // Logic test 500
    });
  });

  // --- KHỐI 3: KIỂM THỬ LOGIC ĐẶC BIỆT (SPECIAL CASES) ---
  describe('⚠️ Trường hợp Token hết hạn (401 + expired)', () => {
    // Setup và Cleanup cho window.location và saveRedirectURL
    // ... beforeAll, afterAll

    it('Nên gọi saveRedirectURL và redirect về /login.html', async () => {
      // Logic test redirect
    });
    
    it('Nên ném lỗi (không redirect) nếu 401 nhưng không có expired: true', async () => {
      // Logic test 401 thường
    });
  });
});