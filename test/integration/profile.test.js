import { requestApi } from "./apiUtils.js";
import { AUTH_TOKEN } from './authSetup.test.js'; 
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import studentProfileService from '@/services/studentProfile.service.js';

describe('API Tests cho Endpoint /profile', () => {
    let token;
    let getProfileByUserIdSpy;

    beforeAll(() => {
        token = AUTH_TOKEN;
        expect(token).not.toBe('');
    });

    afterEach(() => {
        if (getProfileByUserIdSpy) {
            getProfileByUserIdSpy.mockRestore();
        }
    });

    it('should return 200 and profile data when profile exists', async () => {
    // Mock a successful profile response
    const mockProfile = {
        _id: '123',
        userId: 'user123',
        studentId: 's12345',
        fullName: 'Nguyễn Văn A',
        email: 'test@example.com'
    };

    // Mock the service method
    getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId')
        .mockResolvedValue(mockProfile);

    const response = await requestApi('GET', '/profile', {}, {
        'Authorization': `Bearer ${token}`
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'success');
    expect(response.data.data).toMatchObject({
        userId: mockProfile.userId,
        studentId: mockProfile.studentId,
        fullName: mockProfile.fullName
    });
});

    it('should return 404 when profile does not exist', async () => {
        // Mock the service to return null (profile not found)
        getProfileByUserIdSpy = vi.spyOn(studentProfileService, 'getProfileByUserId')
            .mockResolvedValue(null);

        const response = await requestApi('GET', '/profile', {}, {
            'Authorization': `Bearer ${token}`
        });
        console.log("response data: ", response.data);
        expect(response.status).toBe(404);
        expect(response.data).toHaveProperty('status', 'error');
        expect(response.data).toHaveProperty('message');
        expect(response.data.message).toContain('Không tìm thấy hồ sơ hoặc không thể cập nhật');
    });
});