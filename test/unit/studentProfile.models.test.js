import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import StudentProfile from '../../src/models/studentProfile.model.js';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Create MongoDB Memory Server instance
let mongoServer = null;

// Store original mongoose connection
let originalConnection;

// Connect to the in-memory database before tests run
beforeAll(async () => {
    // Bổ sung: Kiểm tra trạng thái kết nối
    if (mongoose.connection.readyState === 1) { // 1 là trạng thái 'Connected'
        console.log("Sử dụng kết nối MongoDB hiện có.");
        return; 
    }
  
    // Create new in-memory mongo server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

// Clear all test data after each test
afterEach(async () => {
  await StudentProfile.deleteMany({});
});


afterAll(async () => {
    // Close the in-memory database connection
    await mongoose.disconnect();
    
    // KIỂM TRA trước khi gọi stop()
    if (mongoServer) { 
      await mongoServer.stop();
    }
    
    // Restore the original connection
    mongoose.connection = originalConnection;
  });
describe('StudentProfile Model', () => {
  // ... rest of the test code remains the same
  const validStudentProfile = {
    personalInfo: {
      fullName: 'Nguyen Van A',
      studentId: 'D123456',
      email: 'd123456@student.dtu.edu.vn',
      phone: '0901234567',
      dateOfBirth: new Date('2000-01-01'),
      gender: 'Nam',
      avatarUrl: 'https://example.com/avatar.jpg'
    },
    academicInfo: {
      faculty: 'Công nghệ thông tin',
      major: 'Kỹ thuật phần mềm',
      academicYear: 4,
      class: '20DTH1'
    },
    skillsAndPreferences: {
      skills: ['JavaScript', 'Node.js', 'React'],
      bio: 'A passionate developer'
    }
  };

  it('should create and save a student profile successfully', async () => {
    const studentProfile = new StudentProfile(validStudentProfile);
    const savedProfile = await studentProfile.save();
    
    // Verify the saved profile
    expect(savedProfile._id).toBeDefined();
    expect(savedProfile.personalInfo.fullName).toBe(validStudentProfile.personalInfo.fullName);
    expect(savedProfile.personalInfo.email).toBe(validStudentProfile.personalInfo.email.toLowerCase());
    expect(savedProfile.academicInfo.major).toBe(validStudentProfile.academicInfo.major);
    expect(savedProfile.skillsAndPreferences.skills).toEqual(
      expect.arrayContaining(validStudentProfile.skillsAndPreferences.skills)
    );
  });


  it('should require all required fields', async () => {
    const studentProfile = new StudentProfile({});
    let error = null;
    
    try {
      await studentProfile.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    // Check for required fields in the error
    expect(error.errors).toHaveProperty('personalInfo.fullName');
    expect(error.errors).toHaveProperty('personalInfo.studentId');
    expect(error.errors).toHaveProperty('personalInfo.email');
    expect(error.errors).toHaveProperty('personalInfo.phone');
    expect(error.errors).toHaveProperty('personalInfo.dateOfBirth');
    expect(error.errors).toHaveProperty('personalInfo.gender');
    expect(error.errors).toHaveProperty('academicInfo.faculty');
    expect(error.errors).toHaveProperty('academicInfo.major');
    expect(error.errors).toHaveProperty('academicInfo.academicYear');
    expect(error.errors).toHaveProperty('academicInfo.class');
  });

  it('should enforce unique studentId and email', async () => {
    // Sử dụng JSON.parse(JSON.stringify(validStudentProfile)) nếu cần deep copy
    const initialData = { ...validStudentProfile }; 
    
    const student1 = new StudentProfile(initialData);
    await student1.save();
    
    // Gán trực tiếp giá trị của student1 cho student2
    const student2 = new StudentProfile({
      ...initialData,
      personalInfo: {
        ...initialData.personalInfo,
        // Lấy trực tiếp giá trị đã lưu vào DB từ student1
        studentId: student1.personalInfo.studentId, 
        email: student1.personalInfo.email,
      },
    });
    
    let error = null;
    try {
      await student2.save();
    } catch (err) {
      error = err;
    }
    
    // Nếu error.code là undefined, tức là không có lỗi Duplicate Key (11000) được ném ra.
    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // PHẢI LÀ 11000
    expect(error.message).toContain('duplicate key error');
  });
  
 it('should validate gender enum values', async () => {
  let error;
  
  // 1. Tạo bản sao đầy đủ (deep copy) của profile hợp lệ
  // Giả định 'validStudentProfile' là một đối tượng JavaScript đã định nghĩa trước
  const profileData = JSON.parse(JSON.stringify(validStudentProfile)); 
  
  // 2. Chỉ thay đổi trường 'gender'
  profileData.personalInfo.gender = 'InvalidGender';
  
  // 3. Khởi tạo mô hình
  const studentProfile = new StudentProfile(profileData);
  
  try {
    // 4. Sử dụng validate() để kiểm tra lỗi xác thực
    await studentProfile.validate();
  } catch (err) {
    error = err;
  }
  
  // 5. Kiểm tra kết quả
  expect(error).toBeDefined();
  expect(error.name).toBe('ValidationError');
  // Lỗi enum được Mongoose báo là thuộc trường personalInfo.gender
  expect(error.errors['personalInfo.gender'].message).toContain('is not a valid enum value');
});
it('should validate gender enum values', async () => {
  let error;
  
  // 1. Tạo bản sao đầy đủ (deep copy) của profile hợp lệ
  // Giả định 'validStudentProfile' là một đối tượng JavaScript đã định nghĩa trước
  const profileData = JSON.parse(JSON.stringify(validStudentProfile)); 
  
  // 2. Chỉ thay đổi trường 'gender'
  profileData.personalInfo.gender = 'InvalidGender';
  
  // 3. Khởi tạo mô hình
  const studentProfile = new StudentProfile(profileData);
  
  try {
    // 4. Sử dụng validate() để kiểm tra lỗi xác thực
    await studentProfile.validate();
  } catch (err) {
    error = err;
  }
  
  // 5. Kiểm tra kết quả
  expect(error).toBeDefined();
  expect(error.name).toBe('ValidationError');
  // Lỗi enum được Mongoose báo là thuộc trường personalInfo.gender
  expect(error.errors['personalInfo.gender'].message).toContain('is not a valid enum value');
});

  it('should validate academicYear minimum value', async () => {
    const invalidAcademicYearProfile = {
      ...validStudentProfile,
      academicInfo: {
        ...validStudentProfile.academicInfo,
        academicYear: 0 // Invalid: below minimum value of 1
      }
    };
    
    const studentProfile = new StudentProfile(invalidAcademicYearProfile);
    let error = null;
    
    try {
      await studentProfile.validate();
    } catch (err) {
      error = err;
    }
    
    expect(error).toBeDefined();
    expect(error.errors['academicInfo.academicYear'].message).toContain('is less than minimum allowed value');
  });
});
