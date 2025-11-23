import request from 'supertest';
import express from 'express';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import studentProfileRoutes from '@src/routes/studentProfile.routes.js';
import ApiError from '@src/utils/ApiError.js';

// Mock the controller
const mockController = {
  getProfiles: vi.fn(),
  getProfileById: vi.fn(),
  createProfile: vi.fn(),
  updateProfile: vi.fn(),
  deleteProfile: vi.fn()
};

vi.mock('../../../../src/controllers/studentProfile.controller.js', () => ({
  default: mockController,
  ...mockController
}));

// Import the mocked controller

// Create test app
const app = express();
app.use(express.json());
app.use('/api/student-profiles', studentProfileRoutes);

// Test data
const mockProfile = {
  _id: '60d21b4667d0d8992e610c85',
  studentId: 'SE12345',
  personalInfo: {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '0123456789'
  }
};

describe('Student Profile Routes', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/student-profiles', () => {
    it('should return 200 and list of profiles', async () => {
      // Mock the controller method
      mockController.getProfiles.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: [mockProfile]
        });
      });

      const response = await request(app)
        .get('/api/student-profiles')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: [mockProfile]
      });
    });

    it('should handle search query', async () => {
      // Mock the controller method
      mockController.getProfiles.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: [mockProfile]
        });
      });

      const response = await request(app)
        .get('/api/student-profiles?search=test')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: [mockProfile]
      });
    });
  });

  describe('POST /api/student-profiles', () => {
    it('should create a new profile and return 201', async () => {
      const newProfile = { ...mockProfile, studentId: 'SE54321' };
      
      // Mock the controller method
      mockController.createProfile.mockImplementation((req, res) => {
        res.status(201).json({
          status: 'success',
          message: 'Thêm hồ sơ thành công',
          item: newProfile
        });
      });

      const response = await request(app)
        .post('/api/student-profiles')
        .send(newProfile)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Thêm hồ sơ thành công',
        item: newProfile
      });
    });

    it('should return 409 if student ID or email already exists', async () => {
      const error = new ApiError(409, 'Mã sinh viên hoặc Email đã tồn tại.');
      
      // Mock the controller method
      mockController.createProfile.mockImplementation((req, res, next) => {
        next(error);
      });

      const response = await request(app)
        .post('/api/student-profiles')
        .send(mockProfile)
        .expect(409);

      expect(response.body.message).toBe('Mã sinh viên hoặc Email đã tồn tại.');
    });
  });

  // Add similar test cases for PUT and DELETE endpoints
  describe('PUT /api/student-profiles/:id', () => {
    it('should update a profile and return 200', async () => {
      const updatedProfile = { ...mockProfile, personalInfo: { ...mockProfile.personalInfo, fullName: 'Updated Name' } };
      
      // Mock the controller method
      mockController.updateProfile.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          data: updatedProfile
        });
      });

      const response = await request(app)
        .put(`/api/student-profiles/${mockProfile._id}`)
        .send(updatedProfile)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: updatedProfile
      });
    });

    it('should return 404 if profile not found', async () => {
      const error = new ApiError(404, 'Hồ sơ không tìm thấy.');
      
      // Mock the controller method
      mockController.updateProfile.mockImplementation((req, res, next) => {
        next(error);
      });

      const response = await request(app)
        .put(`/api/student-profiles/nonexistentid`)
        .send(mockProfile)
        .expect(404);

      expect(response.body.message).toBe('Hồ sơ không tìm thấy.');
    });
  });

  describe('DELETE /api/student-profiles/:id', () => {
    it('should delete a profile and return 200', async () => {
      // Mock the controller method
      mockController.deleteProfile.mockImplementation((req, res) => {
        res.status(200).json({
          status: 'success',
          message: 'Xóa hồ sơ thành công'
        });
      });

      const response = await request(app)
        .delete(`/api/student-profiles/${mockProfile._id}`)
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Xóa hồ sơ thành công'
      });
    });

    it('should return 404 if profile to delete is not found', async () => {
      const error = new ApiError(404, 'Hồ sơ không tìm thấy để xóa.');
      
      // Mock the controller method
      mockController.deleteProfile.mockImplementation((req, res, next) => {
        next(error);
      });

      const response = await request(app)
        .delete('/api/student-profiles/nonexistentid')
        .expect(404);

      expect(response.body.message).toBe('Hồ sơ không tìm thấy để xóa.');
    });
  });
});