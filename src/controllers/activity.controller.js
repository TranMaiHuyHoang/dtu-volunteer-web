import ActivityService from '../services/activity.service.js';
import { BadRequestError } from '../errors/customError.js';

class ActivityController {
  // Create a new activity
  static async createActivity(req, res, next) {
    const activity = await ActivityService.createActivity(req.body);
    res.status(201).json({
      success: true,
      data: activity
    });
  }

  // Get all activities with optional filters
static async getActivities(req, res, next) {
    try {
        const filters = req.query; 

        // 2. Gọi hàm Service và truyền toàn bộ đối tượng filters (bao gồm cả 'search')
        const result = await ActivityService.getActivities(filters); 

        // 3. Trả về kết quả
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        // Xử lý lỗi tập trung
        next(error); 
    }
}

  // Get activity by ID
  static async getActivityById(req, res, next) {
    const activity = await ActivityService.getActivityById(req.params.id);
    res.status(200).json({
      success: true,
      data: activity
    });
  }

  // Update activity
  static async updateActivity(req, res, next) {
    const activity = await ActivityService.updateActivity(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: activity
    });
  }

  // Delete activity
  static async deleteActivity(req, res, next) {
    await ActivityService.deleteActivity(req.params.id);
    res.status(200).json({
      success: true,
      data: {}
    });
  }

  // Register volunteer for an activity
  static async registerVolunteer(req, res, next) {
    // 1. Đã đổi tên biến để khớp với Schema (ref: 'StudentProfile')
    const { studentProfileId } = req.body; 

    // 2. Kiểm tra tính hợp lệ
    if (!studentProfileId) {
        // Thông báo lỗi rõ ràng hơn
        throw new BadRequestError('Thiếu ID hồ sơ sinh viên để đăng ký'); 
    }
    
    // 3. Gọi Service với studentProfileId
    const activity = await ActivityService.registerVolunteer(req.params.id, studentProfileId);
    
    res.status(200).json({
        success: true,
        data: activity,
        message: 'Đăng ký tham gia hoạt động thành công'
    });
}

  // Unregister volunteer from an activity
  static async unregisterVolunteer(req, res, next) {
    const { volunteerId } = req.body;
    if (!volunteerId) {
      throw new BadRequestError('Thiếu thông tin tình nguyện viên');
    }
    
    const activity = await ActivityService.unregisterVolunteer(req.params.id, volunteerId);
    res.status(200).json({
      success: true,
      data: activity,
      message: 'Hủy đăng ký tham gia hoạt động thành công'
    });
  }
}

export default ActivityController;
