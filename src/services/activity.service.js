import Activity from '../models/activity.model.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/customError.js';
import mongoose from 'mongoose';

function escapeRegex(text) {
    // Thoát tất cả các ký tự đặc biệt trong Regex
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function buildActivityQuery(filters = {}) {
    const { category, status, search } = filters;
    const query = {};

    // 1. Lọc theo Danh mục (Category)
    if (category) {
        // Giả sử categories là một mảng trong Schema
        query.categories = { $regex: category, $options: 'i' };; 
    }

    // 2. Lọc theo Trạng thái (Status)
    if (status) {
        query.status = { $regex: status, $options: 'i' };
    }

    // 3. Tìm kiếm theo Tên/Tiêu đề (Search by Title)
    if (search && search.trim() !== '') {
        const safeSearch = escapeRegex(search.trim());
        console.log(" test: ", safeSearch);
        // 💡 ĐIỂM CẢI THIỆN: Dùng $regex an toàn trên trường 'title'
        query.title = { $regex: safeSearch, $options: 'i' };
    }

    return query;
}

class ActivityService {
  static async createActivity(activityData) {
    const activity = new Activity(activityData);
    return await activity.save();
  }

  static async getActivities(filters = {}) {
    const { 
        page = 1, 
        limit = 10,
        // Không cần giải nén category, status, search ở đây nữa
    } = filters;

    // 🌟 THAY THẾ LOGIC CŨ BẰNG VIỆC GỌI HÀM ĐÃ TÁCH BIỆT
    const query = buildActivityQuery(filters);
    // --- BẮT ĐẦU PHẦN XỬ LÝ TRUY VẤN MONGODB ---

    const activitiesDocs = await Activity.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
            path: 'registeredVolunteers',
            select: 'user',
            populate: {
                path: 'user',
                select: 'fullName email'
            }
        })
        .populate('organizer', 'organizationName contactEmail')
        .sort({ startDate: 1 })
        .setOptions({ virtuals: true });
        
    const activitiesResponse = activitiesDocs.map(activityDoc => {
        return activityDoc.toActivityResponse();
    });

    const total = await Activity.countDocuments(query);
    
    // 💡 ĐIỂM CẦN CẢI THIỆN 2: Việc tính toán `total` có thể được tối ưu
    // bằng cách sử dụng aggregation pipeline (với $facet) để lấy dữ liệu và tổng 
    // cùng một lúc trong các ứng dụng lớn hơn.

    return {
        data: activitiesResponse,
        pagination: {
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit)
        }
    };
}


  // Get activity by ID
  static async getActivityById(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundError('ID hoạt động không hợp lệ.');
    }
    const activity = await Activity.findById(id).populate('registeredVolunteers', 'fullName email');
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }
    return activity;
  }

  // Update activity
  static async updateActivity(id, updateData) {
    const activity = await Activity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    return activity;
  }

  // Delete activity
  static async deleteActivity(id) {
    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }
    return activity;
  }

  static async registerVolunteer(activityId, studentProfileId) {

    // 1. Lấy activity thật (không populate)
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Hoạt động không tồn tại');
    }

    // 2. Kiểm tra số chỗ còn trống bằng virtual
    if (activity.availableSpots <= 0) {
      throw new BadRequestError('Đã hết chỗ đăng ký');
    }

    // 3. Kiểm tra trùng lặp
    if (activity.registeredVolunteers.includes(studentProfileId)) {
      throw new ConflictError('Bạn đã đăng ký tham gia hoạt động này rồi');
    }

    // 4. Cập nhật atomic: chỉ thêm nếu chưa tồn tại
    const updatedActivity = await Activity.findOneAndUpdate(
      { _id: activityId },
      { $addToSet: { registeredVolunteers: studentProfileId } }, // Không bao giờ trùng
      { new: true }
    );

    // 5. Nếu sau khi update số chỗ = 0 → set status = Full
    if (updatedActivity.availableSpots === 0 && updatedActivity.status !== 'Full') {
      updatedActivity.status = 'Full';
      await updatedActivity.save();
    }

    return updatedActivity;
  }

  // Unregister volunteer from an activity
  static async unregisterVolunteer(activityId, volunteerId) {
    //   const activity = await Activity.findById(activityId);

    //   if (!activity) {
    //     throw new NotFoundError('Hoạt động không tồn tại');
    //   }

    //   const volunteerIndex = activity.registeredVolunteers.indexOf(volunteerId);
    //   if (volunteerIndex === -1) {
    //     throw new BadRequestError('Bạn chưa đăng ký tham gia hoạt động này');
    //   }

    //   activity.registeredVolunteers.splice(volunteerIndex, 1);
    //   activity.availableSpots += 1;

    //   if (activity.status === 'Full' && activity.availableSpots > 0) {
    //     activity.status = activity.date > new Date() ? 'Active' : 'Completed';
    //   }

    //   return await activity.save();
  }
}

export default ActivityService;