import { requestApi } from "./apiUtils.js";
import { AUTH_TOKEN } from './authSetup.test.js';
import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from 'vitest';
import studentProfileService from '@/services/studentProfile.service.js';

describe('API Tests cho Endpoint /profile', () => {
    let token;
    let getProfileByUserIdSpy;

    beforeAll(() => {
        token = AUTH_TOKEN;
        expect(token).not.toBe('');
        // getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId');
    });
    afterEach(() => {
        // Chỉ khôi phục nếu Spy đã được gán giá trị
        if (getProfileByUserIdSpy) {
            getProfileByUserIdSpy.mockRestore(); 
        }
    });
    // beforeEach(() => {
    //     vi.restoreAllMocks();
    //     getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId');
    // })
    // afterEach(() => {
    //     // Cả hai hàm này đảm bảo spy được reset hoàn toàn về trạng thái ban đầu
    //     getProfileByUserIdSpy.mockClear(); // Xóa lịch sử gọi (Number of calls: 0)
    //     getProfileByUserIdSpy.mockReset(); // Xóa giá trị mockResolvedValue/mockRejectedValue của test case trước
    // });
    // afterEach(() => {
    //     if (getProfileByUserIdSpy) {
    //         getProfileByUserIdSpy.mockRestore();
    //     }
    // });
    it('should return 404 when profile does not exist', async () => {
        // Mock the service to return null (profile not found)
        getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId')
            .mockResolvedValue(null); // Chỉ mock cho test case này

        const response = await requestApi('GET', '/profile', {}, {
            'Authorization': `Bearer ${token}`
        });

        console.log("response data: ", response.data);
        console.log("Response Status:", response.status);
        expect(getProfileByUserIdSpy).toHaveBeenCalled();
        expect(response.status).toBe(404);
        expect(response.data).toHaveProperty('status', 'error');
        expect(response.data).toHaveProperty('message');
        expect(response.data.message).toContain('Không tìm thấy hồ sơ hoặc không thể cập nhật');
    });

    it('should return 200 and profile data when profile exists', async () => {

        // 1. TẠO DỮ LIỆU MOCK NGẪU NHIÊN/LINH HOẠT
        const dynamicFullName = 'User Name ' + Math.random().toString(36).substring(7);
        const dynamicStudentId = 'S' + Math.floor(Math.random() * 100000);

        // Tạo đối tượng Mock linh hoạt, nhưng dùng ID cố định
        const mockProfile = {
            // _id trong DB
            _id: 'mock-profile-id',
            studentId: dynamicStudentId,
            fullName: dynamicFullName,
            // ...
        };
        getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId')
            .mockResolvedValue(mockProfile);

        const response = await requestApi('GET', '/profile', {}, {
            'Authorization': `Bearer ${token}`
        });

        // 💡 2. QUAN TRỌNG: Khôi phục ngay lập tức để không ảnh hưởng test 200
        getProfileByUserIdSpy.mockRestore();
        expect(response.status).toBe(200);
    });


});