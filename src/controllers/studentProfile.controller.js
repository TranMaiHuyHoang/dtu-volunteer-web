import studentProfileService from '../services/studentProfile.service.js';
// Lấy danh sách hồ sơ sinh viên


export const getProfile = async (req, res) => {
        // Lấy userId từ Token xác thực 
        const userId = req.user._id;
        console.log('User ID từ token:', userId);
        const profileData = await studentProfileService.getProfileByUserId(userId);
        
        if (!profileData) {
            // Trường hợp: Người dùng tồn tại nhưng Profile chưa được tạo lần nào
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found. Please complete registration.',
                data: null
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Tải dữ liệu thành công',
            data: profileData // Trả về đối tượng Profile duy nhất
        });

};


// Thêm hồ sơ mới
export const createProfile = async (req, res, next) => {
    const data = req.body;
    const newProfile = await studentProfileService.createProfile(data);

    res.status(201).json({
        status: 'success',
        message: 'Thêm hồ sơ thành công',
        item: newProfile
    });
}; // Chức năng này nên được bọc trong catchAsync

// Cập nhật hồ sơ
export const updateProfile = async (req, res, next) => {
    const id = req.params.id;
    const data = req.body;
    const updatedProfile = await studentProfileService.updateProfile(id, data);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật hồ sơ thành công',
        item: updatedProfile
    });
}; // Chức năng này nên được bọc trong catchAsync

// Xóa hồ sơ
export const deleteProfile = async (req, res, next) => {
    const id = req.params.id;
    const result = await studentProfileService.deleteProfile(id);

    res.status(200).json({
        status: 'success',
        message: result.message
    });
}; // Chức năng này nên được bọc trong catchAsync

