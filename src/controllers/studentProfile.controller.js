import studentProfileService from '../services/studentProfile.service.js';
// Lấy danh sách hồ sơ sinh viên


export const getProfile = async (req, res) => {
    const userId = req.user._id;
    console.log('test user ',req.user);
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

    // 1. Lấy userId từ Token xác thực (Giống như hàm getProfile)
    // Yêu cầu middleware xác thực phải đặt req.user._id
    const userId = req.user._id;
    //console.log(`[Controller] Đang tìm Profile cho User ID: ${userId}`); // <--- DÒNG KIỂM TRA MỚI

    // 2. Lấy dữ liệu cập nhật từ body request
    const data = req.body;
    //console.log("Dữ liệu nhận được để update: " + JSON.stringify(data));
    // 3. Tìm Profile dựa trên userId và cập nhật nó
    // (Giả định studentProfileService.updateProfileByUserId đã được thêm)
    const updatedProfile = await studentProfileService.updateProfileByUserId(userId, data);

    if (!updatedProfile) {
        // Trường hợp: Profile chưa được tạo lần nào
        return res.status(404).json({
            status: 'error',
            message: 'Không tìm thấy profile hoặc không thể cập nhật.',
        });
    }
    else {
    res.status(200).json({
        status: 'success',
        message: 'Cập nhật profile thành công',
        data: updatedProfile // Trả về đối tượng Profile đã cập nhật
    });
}
};
// Xóa hồ sơ
// export const deleteProfile = async (req, res, next) => {
//     const id = req.params.id;
//     const result = await studentProfileService.deleteProfile(id);

//     res.status(200).json({
//         status: 'success',
//         message: result.message
//     });
// }; // Chức năng này nên được bọc trong catchAsync

