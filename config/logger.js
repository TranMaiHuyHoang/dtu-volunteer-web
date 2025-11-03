const winston = require('winston');
const path = require('path');
// 1. IMPORT: Thêm transport cho việc xoay vòng file log
const DailyRotateFile = require('winston-daily-rotate-file');

// Tạo thư mục logs nếu chưa tồn tại
const fs = require('fs');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Định nghĩa các mức độ log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Màu sắc cho từng mức log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Định dạng log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: false }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 2. CONFIG: Định nghĩa transport cho Combined Log (ghi tất cả log)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'), // Tên file có ngày tháng
  datePattern: 'YYYY-MM-DD', // Xoay vòng hàng ngày
  zippedArchive: true, // Nén file cũ
  maxSize: '20m', // Giới hạn kích thước mỗi file là 20MB
  maxFiles: '14d', // Giữ lại log trong 14 ngày (sau đó xóa)
  level: 'debug', // Mức log thấp nhất (ghi tất cả)
});

// 3. CONFIG: Định nghĩa transport cho Error Log (chỉ ghi log lỗi)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m', // Giới hạn kích thước mỗi file là 10MB
  maxFiles: '7d', // Giữ lại log lỗi trong 7 ngày
  level: 'error', // CHỈ ghi log mức 'error'
});

// Tạo logger
const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports: [
    new winston.transports.Console({ level: 'debug' }), 
    // Thay thế File Transport cũ bằng cấu hình có giới hạn
    errorFileTransport, 
    combinedFileTransport,
  ],
  exitOnError: false, // Không dừng ứng dụng khi có lỗi ghi log
});

// Xử lý uncaught exceptions
// SỬA: Thay thế File Transport cũ bằng cấu hình có giới hạn
logger.exceptions.handle(
  new winston.transports.Console({format: format}),
  new DailyRotateFile({ 
    filename: path.join(logDir, 'exceptions-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d', // Giữ lại exceptions lâu hơn (ví dụ: 30 ngày)
  })
);


module.exports = logger;