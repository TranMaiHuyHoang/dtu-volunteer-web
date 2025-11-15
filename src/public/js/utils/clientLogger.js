// utils/clientLogger.js
const logQueue = [];
let sendTimeout = null;
const MAX_BATCH = 10;
const FLUSH_INTERVAL = 2000; // 2 giây

export function clientLog(level = 'info', message = '') {
  const logEntry = {
    level: level.toLowerCase(),
    message,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  };

  // Hiển thị ngay console
  console[logEntry.level]?.(`[CLIENT-${logEntry.level.toUpperCase()}] ${logEntry.message}`, logEntry);

  // Thêm vào queue gửi server
  logQueue.push(logEntry);

  if (!sendTimeout && logQueue.length < MAX_BATCH) {
    sendTimeout = setTimeout(flushLogs, FLUSH_INTERVAL);
  } else if (logQueue.length >= MAX_BATCH) {
    flushLogs();
  }
}
function flushLogs() {
  if (logQueue.length === 0) return;

  const payload = [...logQueue];
  logQueue.length = 0;
  clearTimeout(sendTimeout);
  sendTimeout = null;

  fetch('/api/client-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(err => console.error('Client log send failed:', err));
}
