import { requestApi } from "./apiUtils.js";
import { AUTH_TOKEN } from './authSetup.test.js';
import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest'; // Import tất cả từ vitest
import studentProfileService from '@/services/studentProfile.service.js';

describe('Activities API Tests', () => {
    let token;
    let headers;
    let testActivityId; // ID dùng để đăng ký (được lấy từ test GET /activities)
    let getProfileByUserIdSpy;

    // --- Thiết Lập Chung ---
    beforeAll(() => {
        token = AUTH_TOKEN;
        expect(token).not.toBe('');
        // Thiết lập headers mặc định để tái sử dụng
        headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // Thêm Content-Type vào mặc định
        };
    });

    // Hàm tiện ích để tạo nhanh hoạt động (cho các test cần tạo rồi xóa)
    const createTestActivity = async (title = 'Hoạt động test') => {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Thêm 1 giờ
        const newActivity = {
            title,
            description: 'Mô tả test',
            maxSpots: 50,
            hours: 8,
            organizer: '650a6b7e28b1e469c4728510', // Thay bằng ID Organizer hợp lệ
            location: 'Địa điểm tổ chức test',
            startDate: startTime.toISOString(),
            endDate: endTime.toISOString(),
            
        };
        const response = await requestApi('POST', '/activities', newActivity, headers);
        return response.data.data;
    };
    const deleteTestActivity = async (activityId) => {
        if (!activityId) {
            console.warn('[CLEANUP WARNING] Không cung cấp Activity ID để xóa.');
            return null;
        }

        console.log(`[TEST DEBUG] Gọi API: DELETE /activities/${activityId}`);
        try {
            // Thực hiện DELETE và trả về kết quả
            const response = await requestApi('DELETE', `/activities/${activityId}`, {}, headers);
            return response; // Trả về đối tượng phản hồi thành công (ví dụ: status 200)
        } catch (error) {
            // Xử lý lỗi (ví dụ: hoạt động đã bị xóa hoặc 404)
            if (error.response) {
                console.warn(`[CLEANUP WARNING] Xóa hoạt động thất bại (ID: ${activityId}). Status: ${error.response.status}`);
                return error.response; // Trả về đối tượng phản hồi lỗi (ví dụ: status 404)
            }
            console.error(`[CLEANUP ERROR] Lỗi không xác định khi xóa hoạt động ID ${activityId}.`);
            throw error; // Ném lỗi nếu không phải là lỗi HTTP response
        }
    };

    // // --- Cleanup Sau Khi Test (Xóa hoạt động đăng ký) ---
    // afterAll(async () => {
    //     // Clean up bằng cách xóa hoạt động dùng để test register
    //     if (testActivityId) {
    //         await requestApi('DELETE', `/activities/${testActivityId}`, {}, headers);
    //     }
    // });

    // --- Test Cases ---

    it('should return 200 and list of activities (GET /activities)', async () => {
        const response = await requestApi('GET', '/activities', {}, headers);
        const activitiesArray = response.data?.data || [];

        console.log('[###debugActivitiesTest] GET ACTIVITIES RESPONSE:');
        console.dir(response.data, { depth: null });
        expect(response.status).toBe(200);
        expect(Array.isArray(activitiesArray)).toBe(true);

        // Lưu ID cho test đăng ký nếu có hoạt động
        if (activitiesArray.length > 0) {
            testActivityId = activitiesArray[0]._id; 
            const activity = activitiesArray[0];
            expect(activity).toHaveProperty('title');
            expect(activity).toHaveProperty('description');
        }
    });
    
    it('should allow a user to register for an activity (POST /activities/:id/register)', async () => {
        // SỬ DỤNG testActivityId ĐƯỢC LƯU TỪ TEST TRƯỚC
        if (!testActivityId) {
            console.warn('Skipping register test: No activity ID available. Run GET test first.');
            return;
        }

        // Lấy studentProfileId
        const profileResponse = await requestApi('GET', '/profile', {}, headers);
        const studentProfileId = profileResponse.data?.data?.userId;

        if (!studentProfileId) {
            throw new Error('Failed to retrieve student profile ID for registration test');
        }

        // 1. Đăng ký
        const registerResponse = await requestApi(
            'POST',
            `/activities/${testActivityId}/register`,
            { studentProfileId },
            headers
        );
        
        // console.log('[DEBUG REGISTER RESPONSE]:', registerResponse.data);

        expect(registerResponse.status).toBe(200);
        expect(registerResponse.data).toHaveProperty('success', true);
        expect(registerResponse.data.message).toContain('Đăng ký tham gia hoạt động thành công');

        // 2. Xác minh đăng ký thành công qua API GET
        const activityResponse = await requestApi('GET', `/activities/${testActivityId}`, {}, headers);
        const registeredVolunteers = activityResponse.data?.data?.registeredVolunteers || [];

        expect(registeredVolunteers).toContainEqual({
            studentProfileId,
        });
    });

    it('should create a new activity and return 201 (POST /activities)', async () => {
        const createdActivity = await createTestActivity('Test Activity for Create');
        const activityId = createdActivity._id;
        
        expect(activityId).toBeDefined();
        expect(createdActivity.title).toBe('Test Activity for Create');
        // Clean up ngay sau khi test này hoàn thành
        deleteTestActivity(activityId);
    });
    
    it('should delete an activity and return 200 (DELETE /activities/:id)', async () => {
        // Tạo hoạt động độc lập cho test delete
        const createdActivity = await createTestActivity('Activity to be Deleted');
        const activityId = createdActivity._id;

        // Xóa hoạt động
        const deleteResponse = deleteTestActivity(activityId);
        
        // console.log('[DEBUG] DELETE RESPONSE:', deleteResponse.data);
        
        expect(deleteResponse.status).toBe(200);
        // Có thể thêm bước xác minh Activity.findById(activityId) nếu bạn muốn kiểm tra DB
    });

    it('should return 400 when missing required fields (POST /activities)', async () => {
        // Payload thiếu trường 'title'
        const invalidActivity = {
            description: 'Mô tả thiếu tiêu đề',
            maxSpots: 10,
            organizer: '650a6b7e28b1e469c4728510', 
            location: 'Địa điểm test',
            startDate: new Date().toISOString(), 
            endDate: new Date(Date.now() + 3600000).toISOString(),
        };

        const response = await requestApi('POST', '/activities', invalidActivity, headers);
        console.log('[DEBUG] INVALID ACTIVITY RESPONSE:', response.data);
        expect(response.status).toBe(400); 
    });

    it('should return 404 when profile is not found or cannot be updated (GET /profile)', async () => {
        // Mock the service to return null (profile not found)
        getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId')
            .mockResolvedValue(null);

        const response = await requestApi('GET', '/profile', {}, headers);

        // console.log("response data: ", response.data);
        expect(response.status).toBe(404);
        expect(response.data).toHaveProperty('status', 'error');
        expect(response.data.message).toContain('Không tìm thấy hồ sơ hoặc không thể cập nhật');

        // Khôi phục mock sau khi test hoàn tất
        getProfileByUserIdSpy.mockRestore(); 
    });
});