// file: src/config/multerConfig.js

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// === Khai báo __dirname thủ công trong ES6 Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ====================================================

// Định nghĩa nơi lưu trữ file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Sử dụng __dirname để tạo đường dẫn tuyệt đối
        // Đi lên một cấp (..) để ra khỏi thư mục 'config', sau đó vào 'public/uploads'
        cb(null, path.join(__dirname, '..', 'public', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `avatar-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({ storage: storage });

export default upload; // Sử dụng export default