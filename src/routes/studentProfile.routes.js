import express from 'express';

<<<<<<< HEAD
import * as studentProfileController from '../controllers/studentProfile.controller.js';

const router = express.Router();

router.route('/')
    .get(studentProfileController.getProfiles)
    .post(studentProfileController.createProfile);

router.route('/:id')
    .put(studentProfileController.updateProfile)
    .delete(studentProfileController.deleteProfile);
=======
import {getProfile, createProfile, updateProfile} from '../controllers/studentProfile.controller.js';
import upload from '../config/multerConfig.js';
import urlConfig from '../config/urlConfig.js';
import path from 'path';
import User from '../models/user.model.js';
import {studentProfileValidator} from '../middlewares/studentProfileValidator.middleware.js';
// import handleValidationErrors from '../middlewares/validationHandler.middleware.js';

const router = express.Router();
router.route('/')
    .get(getProfile)
    .post(studentProfileValidator.create, createProfile)
    .put(studentProfileValidator.update, updateProfile);


router.post(
  '/:id/avatar',
  upload.single('avatar'), 
  async (req, res) => {
    
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên.' });
    }

    // Lấy tên file đã lưu (basename)
    const fileName = path.basename(req.file.path); 
    // Đường dẫn truy cập công khai: 'uploads/avatar-xxx.jpg'
    const relativePath = path.join('uploads', fileName).replace(/\\/g, '/');

    const finalUrl = `${urlConfig.baseUrl}/${relativePath}`; // URL hoàn chỉnh
        
    const userId = req.params.id;
    try {
        // 1. Cập nhật User Model
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { avatarUrl: finalUrl }, 
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            // Xóa file nếu không tìm thấy User
            // await fs.unlink(filePath); 
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        // 2. Trả về Response
        res.json({
            message: "Cập nhật avatar thành công!",
            userId: userId,
            avatarUrl: finalUrl // URL đã sửa lỗi
        });
        
    } catch (error) {
        console.error("Lỗi xử lý upload/DB:", error);
        // await fs.unlink(filePath); // Luôn xóa file nếu lỗi DB
        res.status(500).json({ message: "Lỗi nội bộ khi cập nhật avatar." });
    }
  }
);


// router.route('/:id')
//     .delete(deleteProfile);
>>>>>>> 52203030bb34a7492dc04b587052c8ca74182db4

export default router;