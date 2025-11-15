import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url); // Lấy path của file hiện tại
const __dirname = dirname(__filename);          // Lấy thư mục /config
const srcRoot = dirname(__dirname);             // Lấy thư mục /src
// Cấu hình cơ bản của OpenAPI (Swagger)
const options = {
    definition: {
        openapi: '3.0.0', // Phiên bản OpenAPI
        info: {
            title: 'Volunteer API Documentation', // Tên API của bạn
            version: '1.0.0',
            description: 'API để quản lý việc đăng ký tình nguyện viên cho các hoạt động.',
        },
        servers: [
            {
                url: 'http://localhost:3000/', // URL cơ sở của API
            },
        ],
    },
    apis: [join(srcRoot, 'routes', '*.js')], // Đường dẫn tới các file route để quét chú thích
};

// Tạo tài liệu Swagger từ cấu hình
const swaggerSpecs = swaggerJsdoc(options);
export default swaggerSpecs;