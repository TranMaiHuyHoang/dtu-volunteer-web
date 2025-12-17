import express from 'express';

const router = express.Router();

// In-memory message store (demo only)
const messages = [];
const MAX_MESSAGES = 5000;
const MAX_RETURN = 100;

function nowIso() {
  return new Date().toISOString();
}

function safeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function clampInt(v, { min = 1, max = 100, def = 100 } = {}) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

// Get recent messages
// Supports: ?limit=100 (1..100), ?beforeTs=ISO, ?includeDeleted=true (optional if you later add soft-delete)
router.get('/messages', (req, res) => {
  const limit = clampInt(req.query.limit, { min: 1, max: MAX_RETURN, def: MAX_RETURN });
  const beforeTs = safeString(req.query.beforeTs);
  const includeDeleted =
    ['true', '1', 'yes', 'on'].includes(String(req.query.includeDeleted ?? '').trim().toLowerCase());

  let list = messages;

  // Optional time cursor (for pagination)
  if (beforeTs) {
    const before = Date.parse(beforeTs);
    if (!Number.isNaN(before)) {
      list = list.filter((m) => Date.parse(m.ts) < before);
    }
  }

  // Optional soft-delete filter (future-proof; harmless if msg.deleted is absent)
  if (!includeDeleted) {
    list = list.filter((m) => m.deleted !== true);
  }

  // Take last N
  return res.json(list.slice(-limit));
});

// Post a new message
router.post('/messages', (req, res) => {
  const body = req.body ?? {};
  const user = safeString(body.user) || 'Anonymous';
  const text = safeString(body.text);

  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  // Better id than Date.now() alone (still demo-grade)
  const msg = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    user,
    text,
    ts: nowIso(),
    deleted: false, // future-proof
  };

  messages.push(msg);

  // Keep memory bounded (drop oldest in chunks for efficiency)
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }

  return res.status(201).json(msg);
});

// Clear messages (demo only) — add a minimal guard to avoid accidental wipe
// Requires header: x-demo-admin: 1  (change/remove as you like)
router.post('/clear', (req, res) => {
  const isAdmin = String(req.header('x-demo-admin') ?? '') === '1';
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  messages.length = 0;
  return res.json({ ok: true });
});
// ===== Helpers =====
function parseBool(v) {
  if (v == null) return false;
  return ['true', '1', 'yes', 'on'].includes(String(v).trim().toLowerCase());
}

function isValidMessageId(id) {
  if (typeof id !== 'string') return false;
  const s = id.trim();
  if (!s) return false;
  return /^[a-zA-Z0-9_-]{1,128}$/.test(s);
}

function findMsg(id) {
  return messages.find((m) => m.id === id);
}

// ===== GET message by id =====
// GET /messages/:id?includeDeleted=true
router.get('/messages/:id', (req, res) => {
  const id = String(req.params.id ?? '').trim();

  // 404 để tránh lộ thông tin id hợp lệ/không hợp lệ
  if (!isValidMessageId(id)) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const includeDeleted = parseBool(req.query.includeDeleted);

  let msg;
  try {
    msg = findMsg(id);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }

  // Không tồn tại hoặc đã xóa (mà không cho phép xem)
  if (!msg || (msg.deleted === true && !includeDeleted)) {
    return res.status(404).json({ error: 'Message not found' });
  }

  return res.json(msg);
});
router.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  const idx = findMsgIndex(id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found' });

  const removed = messages.splice(idx, 1)[0];
  res.json({ ok: true, removed });
});
// Utility function to check for non-empty strings
const asNonEmptyString = (str) => {
  return typeof str === 'string' && str.trim() !== '' ? str.trim() : null;
};

// Utility function to find a message by ID
const findMsg = (id) => messages.find(msg => msg.id === id);

// PATCH route for editing a message
router.patch('/messages/:id', (req, res) => {
  const { id } = req.params;
  const text = asNonEmptyString(req.body?.text);
  const { user, editedAt = new Date().toISOString() } = req.body;

  // Validate the new text content
  if (!text) {
    return res.status(400).json({ error: 'Message text is required and cannot be empty.' });
  }

  // Validate the user (optional)
  if (user && typeof user !== 'string') {
    return res.status(400).json({ error: 'User name must be a string if provided.' });
  }

  const msg = findMsg(id);

  // Check if message exists
  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  // Check if the message is deleted
  if (msg.deleted) {
    return res.status(400).json({ error: 'Cannot edit a deleted message.' });
  }

  // Update the message text and metadata
  msg.text = text;
  msg.editedAt = editedAt;
  if (user) msg.user = user;  // Optionally update the user if provided

  // Log the edit action (for auditing purposes)
  console.log(`Message ${id} updated by ${msg.user} at ${editedAt}`);

  // Return the updated message with success status
  res.status(200).json({
    success: true,
    message: 'Message updated successfully.',
    data: msg,
  });
});

// DELETE route to soft-delete a message
router.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  const msg = findMsg(id);

  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  // Mark the message as deleted, instead of physically removing it
  msg.deleted = true;
  msg.deletedAt = new Date().toISOString();

  // Log the delete action
  console.log(`Message ${id} marked as deleted at ${msg.deletedAt}`);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully.',
    data: msg,
  });
});

// POST route to restore a soft-deleted message
router.post('/messages/restore/:id', (req, res) => {
  const { id } = req.params;
  const msg = findMsg(id);

  if (!msg) {
    return res.status(404).json({ error: 'Message not found.' });
  }

  // Check if the message is deleted
  if (!msg.deleted) {
    return res.status(400).json({ error: 'Message is not deleted, no need to restore.' });
  }

  // Restore the message
  msg.deleted = false;
  msg.deletedAt = null;

  // Log the restore action
  console.log(`Message ${id} restored at ${new Date().toISOString()}`);

  res.status(200).json({
    success: true,
    message: 'Message restored successfully.',
    data: msg,
  });
});

// GET route to fetch all messages (with option for filtering by deletion status)
router.get('/messages', (req, res) => {
  const includeDeleted = String(req.query.includeDeleted || 'false') === 'true';

  // Filter messages based on deletion status
  const filteredMessages = messages.filter((msg) => includeDeleted || !msg.deleted);

  res.json(filteredMessages);
});
router.get('/messages/search', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const user = String(req.query.user || '').trim().toLowerCase();
  const tag = String(req.query.tag || '').trim().toLowerCase();
  const limit = clamp(parseIntSafe(req.query.limit, 100), 1, 500);

  if (!q && !user && !tag) {
    return res.status(400).json({ error: 'Provide at least one filter: q, user, tag' });
  }

  const result = messages
    .filter(m => !m.deleted)
    .filter(m => (q ? (m.text.toLowerCase().includes(q) || m.user.toLowerCase().includes(q)) : true))
    .filter(m => (user ? m.user.toLowerCase() === user : true))
    .filter(m => (tag ? (m.tags || []).map(t => t.toLowerCase()).includes(tag) : true));

  res.json(result.slice(-limit));
});


export default router;
