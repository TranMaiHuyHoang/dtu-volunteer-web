import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
    // Tiêu đề hoạt động, ví dụ: "Teaching English to Underprivileged Children"
    title: {
        type: String,
        required: true,
        trim: true
    },
    // Mô tả ngắn gọn về hoạt động
    description: {
        type: String,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    // Thời gian bắt đầu hoạt động
    startDate: {
        type: Date,
        required: true
    },
    // Thời gian kết thúc hoạt động
    endDate: {
        type: Date,
        required: true
    },
    // Địa điểm hoạt động, ví dụ: "Hoa Vang District, Da Nang"
    location: {
        type: String,
        required: true,
        trim: true
    },
    // Thể loại hoạt động (dùng cho bộ lọc), ví dụ: "education", "environmental"
    categories: [
        {
            type: String,
            enum: ['upcoming', 'education', 'environmental', 'health', 'community', 'other'], // Thêm các enum cần thiết
            required: true
        }
    ],
    // Tổng số chỗ có sẵn (tối đa)
    maxSpots: {
        type: Number,
        required: true,
        min: 1
    },

    // Trạng thái (dùng cho bộ lọc), ví dụ: "Active", "Completed", "Cancelled", "Full"
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled', 'Upcoming', 'Full'], // Thêm các enum cần thiết
        default: 'Upcoming'
    },
    // URL hoặc đường dẫn đến hình ảnh đại diện cho hoạt động
    imageUrl: {
        type: String,
        trim: true
    },
    // Trường tham chiếu đến những tình nguyện viên đã đăng ký (optional, nhưng hữu ích)
    registeredVolunteers: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile' // Sửa từ 'Volunteer' thành 'StudentProfile'
        }
    ],
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizerProfile', // Tham chiếu đến HỒ SƠ TỔ CHỨC
        required: true
    },
    // Ngày tạo bản ghi
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{ 
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    transform: (doc, ret) => {
      delete ret.id;
      delete ret.__v;
      return ret;
    }
  }
);

ActivitySchema.index({
    // 1. Các trường chính được người dùng tìm kiếm
    title: 'text',          // Tiêu đề hoạt động
    description: 'text',    // Mô tả chi tiết
    location: 'text',       // Địa điểm

    // 2. Thêm trọng số (weights) để ưu tiên kết quả tìm kiếm
    // Ví dụ: Title quan trọng gấp 3 lần Location và 2 lần Description
    // MongoDB sẽ dùng các trọng số này để tính điểm liên quan ($score)
}, {
    weights: {
        title: 3, 
        description: 2,
        location: 1
    },
    // Tùy chọn: Định nghĩa ngôn ngữ (giúp xử lý tốt hơn các từ tiếng Việt)
    // Nếu bạn không định nghĩa, MongoDB sẽ dùng thuật toán mặc định (thường là tiếng Anh)
    // language_override: 'language' 
});

ActivitySchema.methods.toActivityResponse = function () {
    // Gọi hàm toObject (hoặc toJSON) để áp dụng các transform cơ bản (id, xóa __v,...)
    const ret = this.toObject(); 

    // ==== XỬ LÝ NESTED RIÊNG BIỆT VÀ TƯỜNG MINH ====
    if (ret.registeredVolunteers) {
        ret.registeredVolunteers = ret.registeredVolunteers.map(reg => {
            // Đảm bảo document con cũng được transform cơ bản 
            // (nếu chúng là Mongoose Document và có Schema tương ứng)
            const regRet = reg.toObject ? reg.toObject() : reg; 
            return {
                registrationId: regRet._id,
                
                // 2. Lấy đầy đủ thông tin user đã được làm phẳng
                userId: regRet.user?._id, 
                userEmail: regRet.user?.email,
                userfullName: regRet.user?.fullName
            };
        });
    }

    // Xử lý các trường nested khác (organizer, etc.) nếu cần...
    // Ví dụ:
    if (ret.organizer && ret.organizer.toObject) {
        ret.organizer = ret.organizer.toObject(); // Áp dụng transform cơ bản cho organizer
    }

    return ret;
};



// Virtual: availableSpots (không lưu trong DB)
ActivitySchema.virtual('availableSpots').get(function () {
    return Math.max(0, this.maxSpots - this.registeredVolunteers.length);
});

const Activity = mongoose.model('Activity', ActivitySchema);
export default Activity;