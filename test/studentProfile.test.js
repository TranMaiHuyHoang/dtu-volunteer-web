// studentProfile.test.js

import request from 'supertest';
import app from '../src/index.js'; // Đường dẫn đến file Express app chính của bạn

// 🟢 KHAI BÁO BIẾN CHO BASE URL
const BASE_URL = '/student-profiles';

// Dữ liệu mẫu
const newProfileData = {
    personalInfo: {
        fullName: 'Test Student',
        studentId: 'T000001',
        email: 'test@example.com',
        phone: '0900000000',
        dateOfBirth: '2000-01-01',
        gender: 'Nam',
    },
    academicInfo: {
        faculty: 'CNTT',
        major: 'SE',
        academicYear: 1,
        class: 'T1'
    }
};

let createdId; 

describe('Student Profile CRUD Basic Test', () => {

    // --- 1. TEST POST (Tạo mới) ---
    it('POST /student-profiles should create a new profile (201)', async () => {
        const response = await request(app)
            .post(BASE_URL) // 👈 SỬ DỤNG BASE_URL
            .send(newProfileData);

        expect(response.statusCode).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.item).toHaveProperty('_id');
        createdId = response.body.item._id; 
    });

    // --- 2. TEST GET (Lấy danh sách) ---
    it('GET /student-profiles should return list (200)', async () => {
        const response = await request(app).get(BASE_URL); // 👈 SỬ DỤNG BASE_URL
        
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    // --- 3. TEST PUT (Cập nhật) ---
    it('PUT /student-profiles/:id should update profile name (200)', async () => {
        const updateData = { personalInfo: { fullName: 'Updated Name' } };
        const response = await request(app)
            .put(`${BASE_URL}/${createdId}`) // 👈 KẾT HỢP BASE_URL VỚI ID
            .send(updateData);

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.item.personalInfo.fullName).toBe('Updated Name');
    });

    // --- 4. TEST LỖI CƠ BẢN (Conflict 409) ---
    it('POST /student-profiles with existing Student ID should fail (409)', async () => {
        const response = await request(app)
            .post(BASE_URL) // 👈 SỬ DỤNG BASE_URL
            .send(newProfileData);
        
        expect(response.statusCode).toBe(409); 
        expect(response.body.status).toBe('error');
    });

    // --- 5. TEST DELETE (Xóa) ---
    it('DELETE /student-profiles/:id should delete profile (200)', async () => {
        const response = await request(app).delete(`${BASE_URL}/${createdId}`); // 👈 KẾT HỢP BASE_URL VỚI ID

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
    });
});