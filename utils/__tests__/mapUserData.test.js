// File: userMapper.test.js (Giả định)
const { mapUserData } = require('../userMapper');
// 1. Phải có khối describe()
describe('Kiểm thử hàm mapUserData', () => {

    // --- KHAI BÁO DỮ LIỆU GIẢ ĐỊNH (MOCK DATA) ---
    const mockUser = {
        // Dữ liệu mà userMapper cần để tạo payload
        id: '68fcbf65522d0ac03ce02bff',
        name: 'Admin Test',
        email: 'admin@example.com',
        role: 'admin', // <-- Cần thuộc tính này

        // Thêm các thuộc tính mà hàm getBaseInfo và getProviderId có thể cần
        displayName: 'Admin Test',
    };

    // 2. Phải có khối test() hoặc it()
    test('Nó phải thêm thuộc tính "role" với giá trị "admin" vào payload', () => {

        // --- 3. GỌI HÀM VÀ TRUYỀN DỮ LIỆU GIẢ ĐỊNH ---
        // Giả sử mapUserData chỉ cần đối tượng user
        const result = mapUserData(mockUser, 'local');

        // --- 4. KHẲNG ĐỊNH (ASSERTION) ---

        // a. Khẳng định Payload có thuộc tính 'role'
        expect(result.payload).toHaveProperty('role');

        // b. Khẳng định giá trị của thuộc tính 'role' là chính xác
        expect(result.payload.role).toBe('admin');

        // c. Khẳng định một số thuộc tính quan trọng khác cũng tồn tại
        expect(result.payload.sub).toBe(mockUser.id);
    });

    test('Nó phải gán vai trò "volunteer" nếu user không có thuộc tính role', () => {
        const mockNoRoleUser = {
            ...mockUser,
            role: undefined, // Hoặc không thêm thuộc tính 'role' vào object này
            // Đảm bảo không có 'role'
        };

        const result = mapUserData(mockNoRoleUser, 'local');

        // Bài test này đúng: Expect nó phải là giá trị mặc định của bạn
        expect(result.payload.role).toBe('volunteer');
    });
});