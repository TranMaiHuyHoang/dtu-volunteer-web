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

export default router;
