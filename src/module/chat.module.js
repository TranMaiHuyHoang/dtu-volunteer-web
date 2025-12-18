import express from 'express';

const router = express.Router();

// In-memory message store for demo purposes
const messages = [];

// Get recent messages
router.get('/messages', (req, res) => {
  // return last 100 messages
  res.json(messages.slice(-100));
});

// Post a new message
router.post('/messages', (req, res) => {
  const { user, text } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const msg = {
    id: Date.now().toString(),
    user: user || 'Anonymous',
    text: text.trim(),
    ts: new Date().toISOString(),
  };

  messages.push(msg);
  // keep memory bounded
  if (messages.length > 5000) messages.shift();

  res.status(201).json(msg);
});

// Clear messages (demo only)
router.post('/clear', (req, res) => {
  messages.length = 0;
  res.json({ ok: true });
});

export default router;
// Biến lưu trữ message
let message = "Hello, World!";

// Lấy message
function getMessage() {
  return message;
}

// Cập nhật message mới
function setMessage(newMessage) {
  message = newMessage;
}

// In message ra console
function printMessage() {
  console.log(message);
}

// Reset message về giá trị mặc định
function resetMessage() {
  message = "Hello, World!";
}

// Kiểm tra message có rỗng không
function isMessageEmpty() {
  return message.trim() === "";
}

// Thêm nội dung vào cuối message
function appendMessage(text) {
  message += text;
}

// Xuất các hàm (nếu dùng module)
export {
  getMessage,
  setMessage,
  printMessage,
  resetMessage,
  isMessageEmpty,
  appendMessage
};

