import { requestApi } from './apiUtils.js';
import { expect } from 'vitest'; // Thêm expect nếu chưa có

// 💡 Đã đổi tên thành AUTH_TOKEN
let AUTH_TOKEN = '';
let USER_ID = '';


export async function performLogin(credentials) {
    const LOGIN_PATH = '/login'; 

    try {
        const response = await requestApi('POST', LOGIN_PATH, credentials);
        
        // 1. Xác nhận HTTP Status và Payload Status
        expect(response.status).toBe(200);
        // Kiểm tra status trong JSON nếu API có trả về
        expect(response.data.status).toBe('success');
        
        // 2. Trích xuất ID và Token (Xử lý các cấu trúc JSON khác nhau)
        const userData = response.data.user || response.data.data;
        
        // Cố gắng tìm ID trong các thuộc tính phổ biến
        const userId = userData?.id || userData?.userId;
        const token = response.data.token;

        if (!token || !userId) {
            console.error("Cấu trúc phản hồi Login không đầy đủ:", response.data);
            throw new Error("Phản hồi Login thiếu Token hoặc User ID.");
        }
        
        return {
            token: token,
            userId: userId
        };
    } catch (error) {
        // Log lỗi rõ ràng trước khi ném ngoại lệ
        console.error("Lỗi API trong performLogin:", error.message || error);
        throw error; // Ném lỗi để beforeAll catch và dừng test
    }
}

describe('SETUP: Lấy Token và ID Người dùng', () => {

    // Regular user credentials
    const userCredentials = {
        email: "abcxyz1@gmail.com",
        password: "Passabcxyz123"
    };

    // Admin credentials for tests that need admin privileges
    const adminCredentials = {
        email: "thisisadmin@gmail.com",
        password: "Password123"
    };

    // 1. **Bước Login** (Sử dụng hàm chung)
    beforeAll(async () => {
        try {
            // First try to login as admin
            try {
                const { token, userId } = await performLogin(adminCredentials);
                AUTH_TOKEN = token;
                USER_ID = userId;
                console.log("Đăng nhập với quyền admin thành công. Token đã được lưu.");
            } catch (error) {
                console.warn("Không thể đăng nhập bằng tài khoản admin, thử với tài khoản thường...");
                // Fallback to regular user if admin login fails
                const { token, userId } = await performLogin(userCredentials);
                AUTH_TOKEN = token;
                USER_ID = userId;
                console.log("Đăng nhập với quyền thường thành công. Token đã được lưu.");
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập trong beforeAll:", error.message || error);
            // Ném lỗi để dừng tất cả các test khác nếu login thất bại
            throw new Error("Không thể đăng nhập. Kiểm tra Server/Credentials.");
        }
    }, 15000); 

    // 2. **Chỉ là một test case xác nhận**
    test('Xác nhận token đã được lấy thành công', () => {
        expect(AUTH_TOKEN).not.toBe('');
        expect(AUTH_TOKEN.length).toBeGreaterThan(10);
    });
});
// Xuất token để các file test khác có thể import và sử dụng (nếu cần)
// 💡 Đã đổi tên trong export
export { AUTH_TOKEN, USER_ID };