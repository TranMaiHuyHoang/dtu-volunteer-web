import { createOrganizerProfile, getAllOrganizerProfiles } from '../services/organizerProfile.service.js';
async function create(req, res, next) {
    try {
        // Lấy dữ liệu hồ sơ từ body yêu cầu
        const newProfileData = req.body; 
        
        // Gọi hàm service để tạo hồ sơ trong DB
        const createdProfile = await createOrganizerProfile(newProfileData);
        
        // Trả về phản hồi thành công (201 Created)
        res.status(201).json({
            status: 'success',
            message: 'Tạo hồ sơ người tổ chức thành công.',
            data: createdProfile // Sử dụng đối tượng phản hồi có cấu trúc
        });

    } catch (err) {
        // Bắt bất kỳ lỗi nào xảy ra (Mongoose validation, DB, v.v.)
        // và chuyển nó đến middleware xử lý lỗi chung (error handler)
        next(err);
    }
}

async function getAll(req, res, next) {
    try {
        // ⚠️ Lưu ý: Trong môi trường thực tế, bạn nên thêm logic phân trang/lọc tại đây
        
        // Gọi hàm service để lấy tất cả hồ sơ từ DB
        const profiles = await getAllOrganizerProfiles();

        // Trả về phản hồi thành công (200 OK)
        res.status(200).json({
            status: 'success',
            results: profiles.length, // Thêm số lượng kết quả
            data: profiles
        });

    } catch (err) {
        // Chuyển lỗi đến middleware xử lý lỗi chung
        next(err);
    }
}


export  { create, getAll };