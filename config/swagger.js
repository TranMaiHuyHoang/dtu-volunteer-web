const swaggerJsdoc = require('swagger-jsdoc');

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
  // Đường dẫn đến các file chứa route (nơi bạn viết comment JSDoc)
  apis: ['./routes/*.js'], // Thay thế bằng đường dẫn thực tế của bạn
};

const specs = swaggerJsdoc(options);

module.exports = specs;