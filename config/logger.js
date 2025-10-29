const winston = require('winston');
const path = require('path');

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

// Tạo logger
const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports: [
    // Ghi log ra console
    new winston.transports.Console(),
    // Ghi log lỗi vào file error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    // Ghi tất cả log vào file combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
  exitOnError: false, // Không dừng ứng dụng khi có lỗi ghi log
});

// Xử lý uncaught exceptions
logger.exceptions.handle(
  new winston.transports.Console({format: format}),
  new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
);


module.exports = logger;
