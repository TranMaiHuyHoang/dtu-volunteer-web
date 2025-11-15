import logger from '../config/logger.js';

export const receiveClientLog = (req, res) => {
  const body = req.body;

  // Hỗ trợ cả 1 log object hoặc mảng log
  const logs = Array.isArray(body) ? body : [body];

  for (const entry of logs) {
    // Destructure an toàn (vì client có thể gửi thiếu trường)
    const {
      level = 'info',
      message = '',
      data = {},
      ...context
    } = entry || {};

    const safeLevel = ['info', 'warn', 'error'].includes(level.toLowerCase())
      ? level.toLowerCase()
      : 'info';

    // Gộp tất cả context kèm data vào meta log
    const meta = {
      ...context,
      data,
      clientTimestamp: entry.timestamp || new Date().toISOString(),
    };

    // Ghi log với Winston (structured)
    logger.log(safeLevel, message, meta);
  }

  // 204 = No Content
  res.status(204).end();
};
