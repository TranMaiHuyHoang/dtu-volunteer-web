import { requestApi } from './apiUtils.js';
import { AUTH_TOKEN } from './authSetup.test.js';
import OrganizerProfile from '@/models/organizerProfile.model.js';

describe('Organizer Profile API', () => {
  let token;
  let testOrganizerProfileCollection;
  let createdProfileId; // ⚠️ Khai báo biến để lưu ID của hồ sơ vừa tạo
  let lastCreatedProfileData;
  beforeAll(async () => {
    // Set up the test environment
    token = AUTH_TOKEN;
    expect(token).not.toBe('');
    // Lấy collection của model OrganizerProfile
    // Đảm bảo model OrganizerProfile đã được import và định nghĩa
    testOrganizerProfileCollection = OrganizerProfile.collection;
  });

  afterEach(async () => {
    // Clean up the test environment
    if (createdProfileId) {
      // Xóa CHÍNH XÁC bản ghi vừa được tạo bằng ID
      await testOrganizerProfileCollection.deleteOne({ _id: createdProfileId });
      createdProfileId = null; // Đặt lại sau khi xóa
    }
    // NOTE: Nếu muốn xóa tất cả sau mỗi test, bạn vẫn giữ lại:
    // await testOrganizerProfileCollection.deleteMany();
  });

  it('should create a new organizer profile and return 201 (POST /organizer-profiles)', async () => {
    // Test data
    const newProfile = {
      organizationName: 'Test Organization',
      contactEmail: 'test@example.com',
      logoUrl: 'https://example.com/logo.png',
    };

    // Make the API request
    const response = await requestApi('POST', '/organizer-profiles', newProfile, {
      'Authorization': `Bearer ${token}`,
    });

    console.log('[DEBUG] RESPONSE DATA:', response.data);

    // Assertions
    expect(response.status).toBe(201);
    // ✅ SỬA LỖI: Kiểm tra 'status' thay vì 'success'
    expect(response.data).toHaveProperty('status', 'success');

    expect(response.data.data).toHaveProperty('_id');

    // ⚠️ LƯU LẠI ID BẢN GHI VỪA TẠO để sử dụng trong afterEach
    createdProfileId = response.data.data._id;

    expect(response.data.data.organizationName).toBe(newProfile.organizationName);
    expect(response.data.data.contactEmail).toBe(newProfile.contactEmail);
    expect(response.data.data.logoUrl).toBe(newProfile.logoUrl);
  });
  it('should return a list of organizer profiles and status 200 (GET /organizer-profiles)', async () => {
        // 1. SETUP DỮ LIỆU ĐỘC LẬP
        // Tạo hồ sơ test ngay tại đây để test GET không phụ thuộc vào test POST.
        const mockProfile = {
            organizationName: 'Independent GET Test Org',
            contactEmail: 'get_test@example.com',
            logoUrl: 'https://example.com/get_test_logo.png',
            isVerified: true
        };
        // ⚠️ TỰ TẠO DỮ LIỆU: Đảm bảo dữ liệu này có trong DB trước khi request GET
        const insertedProfile = await OrganizerProfile.create(mockProfile);

        // 2. MAKE API REQUEST
        const response = await requestApi('GET', '/organizer-profiles', null, {
            'Authorization': `Bearer ${token}`,
        });
        console.log('[DEBUG] RESPONSE DATA FOR GET /:', response.data);
        // 3. ASSERTIONS (Kiểm tra)
        // A. Kiểm tra mã trạng thái HTTP
        expect(response.status).toBe(200);

        // B. Kiểm tra cấu trúc phản hồi
        expect(response.data).toHaveProperty('status', 'success');
        expect(response.data).toHaveProperty('data');
        
        // C. Kiểm tra dữ liệu
        const profiles = response.data.data;
        expect(Array.isArray(profiles)).toBe(true); // Phải là một mảng
        
        // D. Kiểm tra ít nhất có 1 hồ sơ (là hồ sơ vừa tạo)
        expect(profiles.length).toBeGreaterThanOrEqual(1);

        // E. Kiểm tra hồ sơ test vừa tạo có tồn tại và đúng định dạng
        const retrievedProfile = profiles.find(p => p._id.toString() === insertedProfile._id.toString());
        expect(retrievedProfile).toBeDefined();
        expect(retrievedProfile.organizationName).toBe(mockProfile.organizationName);
        expect(retrievedProfile.contactEmail).toBe(mockProfile.contactEmail);
        expect(retrievedProfile).toHaveProperty('isVerified', true); 
    });
});