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
  if (messages.length > 500) messages.shift();

  res.status(201).json(msg);
});

// Clear messages (demo only)
router.post('/clear', (req, res) => {
  messages.length = 0;
  res.json({ ok: true });
});

export default router;
