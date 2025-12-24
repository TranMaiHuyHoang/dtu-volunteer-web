import express from 'express';

const router = express.Router();

/**
 * =========================
 * In-memory store (DEMO)
 * =========================
 * - messages: danh sách tin nhắn
 * - events: audit log (ai làm gì, lúc nào)
 * - sseClients: realtime stream
 */
const ReactionType = Object.freeze({
  LIKE: 'like',
  LOVE: 'love',
  HAHA: 'haha',
  WOW: 'wow',
  SAD: 'sad',
  ANGRY: 'angry',
});

/**
 * @typedef {Object} Attachment
 * @property {string} id
 * @property {string} name
 * @property {string} url
 * @property {string} [mime]
 * @property {number} [size]
 * @property {string} uploadedAt
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} user
 * @property {string} text
 * @property {string} ts
 * @property {string | null} [editedAt]
 * @property {boolean} [deleted]
 * @property {string | null} [deletedAt]
 * @property {boolean} [pinned]
 * @property {string | null} [pinnedAt]
 * @property {string[]} [tags]
 * @property {string | null} [replyTo]
 * @property {string | null} [threadId]
 * @property {Object<string, number>} [reactions]
 * @property {Object<string, Object<string, boolean>>} [reactedBy]
 * @property {Attachment[]} [attachments]
 * @property {Object<string, any>} [meta]
 */

/**
 * @typedef {Object} EventLog
 * @property {string} id
 * @property {'message.create'|'message.edit'|'message.soft_delete'|'message.restore'|'message.hard_delete'|'message.pin'|'message.unpin'|'message.tags.set'|'message.tags.add'|'message.tags.remove'|'message.react'|'messages.clear'|'messages.import'|'messages.export'|'message.hard_delete'} type
 * @property {string} at
 * @property {string} [actor]
 * @property {string} [ip]
 * @property {string} [messageId]
 * @property {any} [detail]
 */

/** @type {Message[]} */
const messages = [];
/** @type {EventLog[]} */
const events = [];
/** @type {Set<express.Response>} */
const sseClients = new Set();

const MAX_MESSAGES = 5000;
const MAX_EVENTS = 20000;

// list defaults
const MAX_RETURN = 100;
const MAX_SEARCH_RETURN = 500;

// rate limit
const POST_LIMIT = 30; // per window
const PATCH_LIMIT = 60;
const WINDOW_MS = 60_000;
/** @type {Map<string, {count: number, resetAt: number}>} */
const hits = new Map();

/**
 * =========================
 * Helpers
 * =========================
 */
function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {any} v
 * @returns {string}
 */
function safeString(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * @param {any} v
 * @returns {string | null}
 */
function asNonEmptyString(v) {
  const s = safeString(v);
  return s ? s : null;
}

/**
 * @param {any} v
 * @returns {boolean}
 */
function parseBool(v) {
  if (v == null) return false;
  return ['true', '1', 'yes', 'on'].includes(String(v).trim().toLowerCase());
}

/**
 * @param {any} v
 * @param {{min?: number, max?: number, def?: number}} [opts]
 * @returns {number}
 */
function clampInt(v, { min = 1, max = 100, def = 100 } = {}) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

/**
 * @param {string} iso
 * @returns {number | null}
 */
function parseIsoToMs(iso) {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * @returns {string}
 */
function genId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * @param {any} id
 * @returns {boolean}
 */
function isValidMessageId(id) {
  if (typeof id !== 'string') return false;
  const s = id.trim();
  if (!s) return false;
  // allow: letters digits _ -
  return /^[a-zA-Z0-9_-]{1,128}$/.test(s);
}

/**
 * @param {string} id
 * @returns {Message | undefined}
 */
function findMsg(id) {
  return messages.find((m) => m.id === id);
}

/**
 * @param {string} id
 * @returns {number}
 */
function findMsgIndex(id) {
  return messages.findIndex((m) => m.id === id);
}

function enforceMaxMessages() {
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }
}

function enforceMaxEvents() {
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

/**
 * @param {any} tags
 * @returns {string[]}
 */
function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  const cleaned = tags
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean)
    .map((t) => t.toLowerCase());
  return [...new Set(cleaned)].slice(0, 20);
}

/**
 * @param {express.Request} req
 * @returns {string}
 */
function getClientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  return xf || req.socket.remoteAddress || 'unknown';
}

/**
 * @param {express.Request} req
 * @returns {boolean}
 */
function isAdmin(req) {
  // DEMO admin header
  return String(req.header('x-demo-admin') ?? '') === '1';
}

/**
 * @param {string} key
 * @param {number} limit
 * @returns {boolean}
 */
function allowRate(key, limit) {
  const now = Date.now();
  const item = hits.get(key);

  if (!item || now > item.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (item.count >= limit) return false;
  item.count += 1;
  return true;
}

/**
 * @param {{type: string, actor?: string, ip?: string, messageId?: string, detail?: any, id?: string, at?: string}} e
 */
function logEvent(e) {
  /** @type {EventLog} */
  const entry = {
    id: e.id || genId(),
    at: e.at || nowIso(),
    type: e.type,
    actor: e.actor,
    ip: e.ip,
    messageId: e.messageId,
    detail: e.detail,
  };
  events.push(entry);
  enforceMaxEvents();
  broadcastSse({ kind: 'event', data: entry });
}

/**
 * @param {Message} m
 * @returns {Omit<Message, 'reactedBy'>}
 */
function sanitizeMessageForPublic(m) {
  // bạn có thể bỏ/giữ reactedBy tuỳ app; ở đây giữ reactions, bỏ reactedBy (privacy)
  const { reactedBy, ...rest } = m;
  return rest;
}

/**
 * @param {any} payload
 */
function broadcastSse(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(data);
    } catch {
      // ignore broken client
    }
  }
}

/**
 * @param {Message[]} list
 * @returns {string}
 */
function computeEtagForList(list) {
  // demo etag: based on last item id + length
  const last = list[list.length - 1];
  const key = `${list.length}:${last?.id || 'none'}:${last?.editedAt || ''}:${last?.deletedAt || ''}`;
  return `W/"${Buffer.from(key).toString('base64')}"`;
}

/**
 * @param {Message} m
 * @returns {string}
 */
function computeCursor(m) {
  // cursor = base64(ts|id) để phân trang
  const raw = `${m.ts}|${m.id}`;
  return Buffer.from(raw).toString('base64');
}

/**
 * @param {string} cursor
 * @returns {{ts: string, id: string} | null}
 */
function parseCursor(cursor) {
  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    const [ts, id] = raw.split('|');
    if (!ts || !id) return null;
    return { ts, id };
  } catch {
    return null;
  }
}

/**
 * =========================
 * SSE realtime stream
 * =========================
 * GET /messages/stream
 * - server-sent events: realtime push
 */
router.get('/messages/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');

  // CORS nếu cần:
  // res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`data: ${JSON.stringify({ kind: 'hello', at: nowIso() })}\n\n`);

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * =========================
 * LIST messages (v2)
 * =========================
 * GET /messages
 * Query:
 * - limit (1..MAX_RETURN)
 * - includeDeleted
 * - beforeTs (ISO) OR cursor (base64(ts|id))
 * - order=asc|desc (default desc)
 * - onlyPinned=true
 * - tag=...
 * - user=...
 */
router.get('/messages', (req, res) => {
  const limit = clampInt(req.query.limit, { min: 1, max: MAX_RETURN, def: MAX_RETURN });
  const includeDeleted = parseBool(req.query.includeDeleted);
  const beforeTs = safeString(req.query.beforeTs);
  const cursor = safeString(req.query.cursor);
  /** @type {'asc' | 'desc'} */
  const order = (safeString(req.query.order).toLowerCase() === 'asc' ? 'asc' : 'desc');
  const onlyPinned = parseBool(req.query.onlyPinned);
  const tag = safeString(req.query.tag).toLowerCase();
  const user = safeString(req.query.user).toLowerCase();

  let list = messages.slice();

  // filters
  if (!includeDeleted) list = list.filter((m) => m.deleted !== true);
  if (onlyPinned) list = list.filter((m) => m.pinned === true);
  if (tag) list = list.filter((m) => (m.tags || []).map((t) => String(t).toLowerCase()).includes(tag));
  if (user) list = list.filter((m) => String(m.user || '').toLowerCase() === user);

  // pagination by beforeTs
  if (beforeTs) {
    const before = parseIsoToMs(beforeTs);
    if (before !== null) {
      list = list.filter((m) => {
        const t = parseIsoToMs(m.ts);
        return t !== null && t < before;
      });
    }
  }

  // pagination by cursor (stronger than beforeTs)
  if (cursor) {
    const c = parseCursor(cursor);
    if (c) {
      const cMs = parseIsoToMs(c.ts);
      if (cMs != null) {
        list = list.filter((m) => {
          const t = parseIsoToMs(m.ts);
          if (t == null) return false;
          // take items strictly older than cursor (ts,id)
          if (t < cMs) return true;
          if (t > cMs) return false;
          return String(m.id) < String(c.id);
        });
      }
    }
  }

  // sort
  list.sort((a, b) => {
    const ta = parseIsoToMs(a.ts) ?? 0;
    const tb = parseIsoToMs(b.ts) ?? 0;
    if (ta !== tb) return order === 'asc' ? ta - tb : tb - ta;
    // stable by id
    return order === 'asc' ? String(a.id).localeCompare(String(b.id)) : String(b.id).localeCompare(String(a.id));
  });

  const sliced = list.slice(0, limit).map(sanitizeMessageForPublic);
  const etag = computeEtagForList(sliced);

  // ETag cache
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.setHeader('ETag', etag);

  // next cursor
  const last = sliced[sliced.length - 1];
  const nextCursor = last ? computeCursor(last) : null;

  return res.json({
    ok: true,
    meta: {
      count: sliced.length,
      limit,
      order,
      nextCursor,
    },
    data: sliced,
  });
});

/**
 * =========================
 * CREATE message
 * =========================
 * POST /messages
 * Body:
 * - user?
 * - text (required)
 * - tags?
 * - replyTo? (message id)
 * - attachments? (metadata only)
 *
 * Supports Idempotency (optional):
 * - header: x-idempotency-key
 */
/** @type {Map<string, {msg: Message, at: number}>} */
const idempo = new Map();
const IDEM_TTL_MS = 5 * 60_000;

function cleanupIdempo() {
  const now = Date.now();
  for (const [k, v] of idempo.entries()) {
    if (now - v.at > IDEM_TTL_MS) idempo.delete(k);
  }
}

router.post('/messages', (req, res) => {
  const ip = getClientIp(req);
  const rateKey = `POST:${ip}`;

  if (!allowRate(rateKey, POST_LIMIT)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  cleanupIdempo();
  const idemKey = safeString(req.header('x-idempotency-key'));
  if (idemKey) {
    const found = idempo.get(idemKey);
    if (found) {
      return res.status(200).json({ ok: true, idempotent: true, data: sanitizeMessageForPublic(found.msg) });
    }
  }

  const body = req.body ?? {};
  const user = asNonEmptyString(body.user) || 'Anonymous';
  const text = asNonEmptyString(body.text);
  const tags = normalizeTags(body.tags);
  const replyTo = asNonEmptyString(body.replyTo);
  /** @type {Attachment[]} */
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
        .filter((a) => a && typeof a === 'object')
        .slice(0, 10)
        .map((a) => ({
          id: genId(),
          name: safeString(a.name) || 'file',
          url: safeString(a.url),
          mime: safeString(a.mime) || undefined,
          size: Number.isFinite(Number(a.size)) ? Number(a.size) : undefined,
          uploadedAt: nowIso(),
        }))
        .filter((a) => !!a.url)
    : [];

  if (!text) return res.status(400).json({ error: 'Message text is required' });

  // thread logic
  let threadId = null;
  if (replyTo) {
    const parent = findMsg(replyTo);
    if (!parent || parent.deleted) {
      return res.status(404).json({ error: 'Parent message not found' });
    }
    threadId = parent.threadId || parent.id;
  }

  /** @type {Message} */
  const msg = {
    id: genId(),
    user,
    text,
    ts: nowIso(),
    editedAt: null,
    deleted: false,
    deletedAt: null,
    pinned: false,
    pinnedAt: null,
    tags,
    replyTo: replyTo || null,
    threadId,

    reactions: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
    reactedBy: {},
    attachments,
  };

  messages.push(msg);
  enforceMaxMessages();

  logEvent({
    type: 'message.create',
    actor: user,
    ip,
    messageId: msg.id,
    detail: { replyTo: msg.replyTo, threadId: msg.threadId, tags: msg.tags, attachments: msg.attachments?.length || 0 },
  });

  // broadcast realtime
  broadcastSse({ kind: 'message', action: 'create', data: sanitizeMessageForPublic(msg) });

  if (idemKey) idempo.set(idemKey, { msg, at: Date.now() });

  return res.status(201).json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

/**
 * =========================
 * GET message by id
 * =========================
 * GET /messages/:id?includeDeleted=true
 */
router.get('/messages/:id', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  const includeDeleted = parseBool(req.query.includeDeleted);

  if (!isValidMessageId(id)) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const msg = findMsg(id);
  if (!msg || (msg.deleted && !includeDeleted)) {
    return res.status(404).json({ error: 'Message not found' });
  }

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

/**
 * =========================
 * PATCH message (super detailed)
 * =========================
 * PATCH /messages/:id
 * Body (any subset):
 * - text (required if provided, cannot be empty)
 * - user (optional)
 * - tags (optional) : set tags fully
 * - meta (optional) : merge shallow
 * Rules:
 * - cannot edit deleted
 * - rate limit
 * - returns prev snapshot
 */
router.patch('/messages/:id', (req, res) => {
  const ip = getClientIp(req);
  const rateKey = `PATCH:${ip}`;
  if (!allowRate(rateKey, PATCH_LIMIT)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  if (msg.deleted) return res.status(400).json({ error: 'Cannot edit a deleted message' });

  const body = req.body ?? {};
  const newText = body.hasOwnProperty('text') ? asNonEmptyString(body.text) : null;
  const newUser = body.hasOwnProperty('user') ? asNonEmptyString(body.user) : null;
  const newTags = body.hasOwnProperty('tags') ? normalizeTags(body.tags) : null;
  const metaPatch = body.hasOwnProperty('meta') && body.meta && typeof body.meta === 'object' ? body.meta : null;

  // Must change at least one field
  if (newText === null && newUser === null && newTags === null && metaPatch === null) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  // If "text" provided but empty => invalid
  if (body.hasOwnProperty('text') && !newText) {
    return res.status(400).json({ error: 'Message text is required and cannot be empty' });
  }

  const prev = {
    text: msg.text,
    user: msg.user,
    tags: (msg.tags || []).slice(),
    meta: msg.meta ? { ...msg.meta } : undefined,
    editedAt: msg.editedAt,
  };

  if (newText) msg.text = newText;
  if (newUser) msg.user = newUser;
  if (newTags) msg.tags = newTags;
  if (metaPatch) msg.meta = { ...(msg.meta || {}), ...metaPatch };

  msg.editedAt = nowIso();

  logEvent({
    type: 'message.edit',
    actor: msg.user,
    ip,
    messageId: msg.id,
    detail: { changed: { text: !!newText, user: !!newUser, tags: !!newTags, meta: !!metaPatch } },
  });

  broadcastSse({ kind: 'message', action: 'edit', data: sanitizeMessageForPublic(msg) });

  return res.json({
    ok: true,
    message: 'Message updated successfully',
    data: sanitizeMessageForPublic(msg),
    prev,
  });
});

/**
 * =========================
 * Soft delete / Restore / Hard delete
 * =========================
 * Soft delete: POST /messages/:id/soft-delete
 * Restore:     POST /messages/:id/restore
 * Hard delete: DELETE /messages/:id (admin only recommended)
 */
router.post('/messages/:id/soft-delete', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  if (msg.deleted) {
    return res.json({ ok: true, message: 'Already deleted', data: sanitizeMessageForPublic(msg) });
  }


  broadcastSse({ kind: 'message', action: 'soft-delete', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.post('/messages/:id/restore', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  broadcastSse({ kind: 'message', action: 'restore', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.delete('/messages/:id', (req, res) => {
  // khuyến nghị admin mới cho hard delete
  if (!isAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const idx = findMsgIndex(id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found' });

  const removed = messages.splice(idx, 1)[0];

  logEvent({
    type: 'message.hard_delete',
    actor: safeString(req.body?.actor) || 'admin',
    ip: getClientIp(req),
    messageId: removed.id,
  });

  broadcastSse({ kind: 'message', action: 'hard-delete', data: sanitizeMessageForPublic(removed) });

  return res.json({ ok: true, removed: sanitizeMessageForPublic(removed) });
});

/**
 * =========================
 * Search (advanced)
 * =========================
 * GET /messages/search?q=...&user=...&tag=...&limit=...
 */
router.get('/messages/search', (req, res) => {
  const q = safeString(req.query.q).toLowerCase();
  const user = safeString(req.query.user).toLowerCase();
  const tag = safeString(req.query.tag).toLowerCase();
  const limit = clampInt(req.query.limit, { min: 1, max: MAX_SEARCH_RETURN, def: 100 });

  if (!q && !user && !tag) {
    return res.status(400).json({ error: 'Provide at least one filter: q, user, tag' });
  }

  const result = messages
    .filter((m) => m.deleted !== true)
    .filter((m) => (q ? (m.text || '').toLowerCase().includes(q) || (m.user || '').toLowerCase().includes(q) : true))
    .filter((m) => (user ? (m.user || '').toLowerCase() === user : true))
    .filter((m) => (tag ? (m.tags || []).map((t) => String(t).toLowerCase()).includes(tag) : true));

  return res.json({ ok: true, meta: { count: Math.min(result.length, limit) }, data: result.slice(0, limit).map(sanitizeMessageForPublic) });
});

/**
 * =========================
 * Tags
 * =========================
 * POST /messages/:id/tags/add    { tags: [] }
 * POST /messages/:id/tags/remove { tags: [] }
 * PUT  /messages/:id/tags        { tags: [] } (set)
 */
router.post('/messages/:id/tags/add', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  const add = normalizeTags(req.body?.tags);
  msg.tags = [...new Set([...(msg.tags || []), ...add])];

  logEvent({ type: 'message.tags.add', actor: msg.user, ip: getClientIp(req), messageId: msg.id, detail: { add } });
  broadcastSse({ kind: 'message', action: 'tags:add', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.post('/messages/:id/tags/remove', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  const rm = new Set(normalizeTags(req.body?.tags));
  msg.tags = (msg.tags || []).filter((t) => !rm.has(String(t).toLowerCase()));

  logEvent({ type: 'message.tags.remove', actor: msg.user, ip: getClientIp(req), messageId: msg.id, detail: { remove: [...rm] } });
  broadcastSse({ kind: 'message', action: 'tags:remove', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.put('/messages/:id/tags', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  const tags = normalizeTags(req.body?.tags);
  msg.tags = tags;

  logEvent({ type: 'message.tags.set', actor: msg.user, ip: getClientIp(req), messageId: msg.id, detail: { tags } });
  broadcastSse({ kind: 'message', action: 'tags:set', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

/**
 * =========================
 * Pin
 * =========================
 * POST /messages/:id/pin
 * POST /messages/:id/unpin
 * GET  /messages/pinned
 */
router.post('/messages/:id/pin', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  msg.pinned = true;
  msg.pinnedAt = nowIso();

  logEvent({ type: 'message.pin', actor: msg.user, ip: getClientIp(req), messageId: msg.id });
  broadcastSse({ kind: 'message', action: 'pin', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.post('/messages/:id/unpin', (req, res) => {
  const id = String(req.params.id ?? '').trim();
  if (!isValidMessageId(id)) return res.status(404).json({ error: 'Message not found' });

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  msg.pinned = false;
  msg.pinnedAt = null;

  logEvent({ type: 'message.unpin', actor: msg.user, ip: getClientIp(req), messageId: msg.id });
  broadcastSse({ kind: 'message', action: 'unpin', data: sanitizeMessageForPublic(msg) });

  return res.json({ ok: true, data: sanitizeMessageForPublic(msg) });
});

router.get('/messages/pinned', (req, res) => {
  const pinned = messages.filter(m => !m.deleted && m.pinned);
  // newest pinned first
  pinned.sort((a, b) => (b.pinnedAt || '').localeCompare(a.pinnedAt || ''));
  res.json(pinned.slice(0, 50));
});
router.post('/messages/:id/soft-delete', (req, res) => {
  const { id } = req.params;
  const msg = findMsg(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  msg.deleted = true;
  msg.deletedAt = new Date().toISOString();
  res.json({ ok: true, msg });
});

router.post('/messages/:id/restore', (req, res) => {
  const { id } = req.params;
  const msg = findMsg(id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  msg.deleted = false;
  delete msg.deletedAt;
  res.json({ ok: true, msg });
});

// Nếu muốn thay GET /messages của bạn thành bản có includeDeleted:
router.get('/messages', (req, res) => {
  const includeDeleted = String(req.query.includeDeleted || 'false') === 'true';
  const list = includeDeleted ? messages : messages.filter(m => !m.deleted);
  res.json(list.slice(-100));
});
router.post('/messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const parent = findMsg(id);
  if (!parent || parent.deleted) return res.status(404).json({ error: 'Parent message not found' });

  const user = asNonEmptyString(req.body?.user) || 'Anonymous';
  const text = asNonEmptyString(req.body?.text);
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  const threadId = parent.threadId || parent.id;

  const msg = {
    id: genId(),
    user,
    text,
    ts: new Date().toISOString(),
    replyTo: parent.id,
    threadId,
  };

  messages.push(msg);
  if (messages.length > 500) messages.shift();

  res.status(201).json(msg);
});

router.get('/threads/:threadId', (req, res) => {
  const { threadId } = req.params;
  const thread = messages
    .filter(m => !m.deleted)
    .filter(m => m.id === threadId || m.threadId === threadId)
    .sort((a, b) => a.ts.localeCompare(b.ts));

  if (!thread.length) return res.status(404).json({ error: 'Thread not found' });

  res.json(thread);
});
router.post('/messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const parent = findMsg(id);
  if (!parent || parent.deleted) return res.status(404).json({ error: 'Parent message not found' });

  const user = asNonEmptyString(req.body?.user) || 'Anonymous';
  const text = asNonEmptyString(req.body?.text);
  if (!text) return res.status(400).json({ error: 'Message text is required' });

  const threadId = parent.threadId || parent.id;

  const msg = {
    id: genId(),
    user,
    text,
    ts: new Date().toISOString(),
    replyTo: parent.id,
    threadId,
  };

  messages.push(msg);
  if (messages.length > 500) messages.shift();

  res.status(201).json(msg);
});

router.get('/threads/:threadId', (req, res) => {
  const { threadId } = req.params;
  const thread = messages
    .filter(m => !m.deleted)
    .filter(m => m.id === threadId || m.threadId === threadId)
    .sort((a, b) => a.ts.localeCompare(b.ts));

  if (!thread.length) return res.status(404).json({ error: 'Thread not found' });

  res.json(thread);
});
const reactionTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];

router.post('/messages/:id/react', (req, res) => {
  const { id } = req.params;
  const user = asNonEmptyString(req.body?.user) || 'Anonymous';
  const type = asNonEmptyString(req.body?.type);

  if (!type || !reactionTypes.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${reactionTypes.join(', ')}` });
  }

  const msg = findMsg(id);
  if (!msg || msg.deleted) return res.status(404).json({ error: 'Message not found' });

  msg.reactions = msg.reactions || { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
  msg.reactedBy = msg.reactedBy || {};

  const perUser = msg.reactedBy[user] || {};
  const already = !!perUser[type];

  // toggle
  if (already) {
    perUser[type] = false;
    msg.reactions[type] = Math.max(0, (msg.reactions[type] || 0) - 1);
  } else {
    perUser[type] = true;
    msg.reactions[type] = (msg.reactions[type] || 0) + 1;
  }

  msg.reactedBy[user] = perUser;
  res.json({ ok: true, msg });
  router.get('/messages/export', (req, res) => {
  // export all (including deleted/pinned/etc.)
  res.json({
    exportedAt: new Date().toISOString(),
    count: messages.length,
    messages,
  });
});

router.post('/messages/import', (req, res) => {
  const incoming = req.body?.messages;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({
      error: 'messages must be an array',
      example: { messages: [{ id: '...', user: '...', text: '...', ts: '2025-01-01T00:00:00.000Z' }] },
    });
  }

  // ===== options =====
  const mode = String(req.query.mode ?? 'replace').trim().toLowerCase(); // replace | merge
  const dedupe = String(req.query.dedupe ?? 'keep_last').trim().toLowerCase(); // keep_last | keep_first
  const maxCap = Number(req.query.max);
  const MAX_CAP_FALLBACK = typeof MAX_MESSAGES === 'number' ? MAX_MESSAGES : 5000;
  const MAX_CAP = Number.isFinite(maxCap) ? Math.max(1, Math.min(MAX_CAP_FALLBACK, Math.trunc(maxCap))) : MAX_CAP_FALLBACK;

  if (!['replace', 'merge'].includes(mode)) {
    return res.status(400).json({ error: 'mode must be replace or merge' });
  }
  if (!['keep_last', 'keep_first'].includes(dedupe)) {
    return res.status(400).json({ error: 'dedupe must be keep_last or keep_first' });
  }

  // ===== local helpers (self-contained) =====
  const nowIso = () => new Date().toISOString();

  const safeString = (v) => (typeof v === 'string' ? v.trim() : '');

  const parseIsoOrNull = (v) => {
    const s = safeString(v);
    if (!s) return null;
    const ms = Date.parse(s);
    return Number.isNaN(ms) ? null : new Date(ms).toISOString();
  };

  const isPlainObject = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

  const normalizeId = (v) => {
    const s = safeString(v);
    if (!s) return null;
    // allow a-zA-Z0-9_- only (same policy as earlier)
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(s)) return null;
    return s;
  };

  const normalizeTags = (v) => {
    if (!Array.isArray(tags)) return [];
    const cleaned = tags
      .map((t) => (typeof t === 'string' ? t.trim() : ''))
      .filter(Boolean)
      .map((t) => t.toLowerCase());
    return [...new Set(cleaned)].slice(0, 20);
  };

  const normalizeAttachments = (v) => {
    if (!Array.isArray(atts)) return [];
    return atts
      .filter((a) => isPlainObject(a))
      .slice(0, 10)
      .map((a) => ({
        id: normalizeId(a.id) || genId(),
        name: safeString(a.name) || 'file',
        url: safeString(a.url),
        mime: safeString(a.mime) || undefined,
        size: Number.isFinite(Number(a.size)) ? Number(a.size) : undefined,
        uploadedAt: parseIsoOrNull(a.uploadedAt) || nowIso(),
      }))
      .filter((a) => !!a.url); // must have url
  };

  const normalizeReactions = (v)=> {
    // allow only known keys, clamp to >=0
    const keys = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    const out = {};
    if (!isPlainObject(v)) return undefined;
    for (const k of keys) {
      const val = Number(v[k]);
      if (Number.isFinite(val)) out[k] = Math.max(0, Math.trunc(val));
    }
    return Object.keys(out).length ? out : undefined;
  };

  const normalizeReactedBy = (v) => {
    // keep minimal sanity, avoid huge payload
    if (!isPlainObject(rb)) return undefined;

    const out = {};
    const users = Object.keys(rb).slice(0, 200); // cap
    for (const u of users) {
      const per = (v)[u];
      if (!isPlainObject(per)) continue;
      const entry = {};
      for (const key of ['like', 'love', 'haha', 'wow', 'sad', 'angry']) {
        if (typeof per[key] === 'boolean') entry[key] = per[key];
      }
      if (Object.keys(entry).length) out[String(u).slice(0, 64)] = entry;
    }

    return Object.keys(out).length ? out : undefined;
  };

  const normalizeMeta = (meta) => {
    // shallow object only; cap size by key count
    if (!isPlainObject(meta)) return undefined;
    const out = {};
    for (const k of Object.keys(meta).slice(0, 50)) {
      out[String(k).slice(0, 64)] = meta[k];
    }
    return out;
  };

  // ===== report =====
  const report = {
    received: incoming.length,
    accepted: 0,
    imported: 0, // new ids
    updated: 0, // existing ids (merge mode)
    skipped: 0, // invalid or empty
    invalid: [],
    duplicates: 0,
    mode,
    dedupe,
    maxCap: MAX_CAP,
  };

  /**
   * ===== Clean + validate each item =====
   * Requirements:
   * - text must be non-empty after trim
   * - ts must be ISO parseable or fallback now
   * - id: if invalid => generate new id (or skip - here we generate)
   */
  const cleaned = [];

  for (let i = 0; i < incoming.length; i++) {
    const m = incoming[i];

    if (!isPlainObject(m)) {
      report.skipped++;
      report.invalid.push({ index: i, reason: 'Item must be an object' });
      continue;
    }

    const textRaw = safeString(m.text);
    const text = textRaw.trim();
    if (!text) {
      report.skipped++;
      report.invalid.push({ index: i, reason: 'text is required' });
      continue;
    }

    const id = normalizeId(m.id) || genId();
    const user = safeString(m.user) || 'Anonymous';

    const ts = parseIsoOrNull(m.ts) || nowIso();
    const editedAt = parseIsoOrNull(m.editedAt) || undefined;
    const deletedAt = parseIsoOrNull(m.deletedAt) || undefined;
    const pinnedAt = parseIsoOrNull(m.pinnedAt) || undefined;

    const deleted = typeof m.deleted === 'boolean' ? m.deleted : undefined;
    const pinned = typeof m.pinned === 'boolean' ? m.pinned : undefined;

    const tags = Array.isArray(m.tags) ? normalizeTags(m.tags) : undefined;

    const replyTo = normalizeId(m.replyTo) || undefined;
    const threadId = normalizeId(m.threadId) || undefined;

    const reactions = normalizeReactions(m.reactions);
    const reactedBy = normalizeReactedBy(m.reactedBy);

    const attachments = normalizeAttachments(m.attachments);
    const meta = normalizeMeta(m.meta);

    cleaned.push({
      id,
      user,
      text,
      ts,
      editedAt,
      deleted,
      deletedAt,
      pinned,
      pinnedAt,
      tags,
      replyTo,
      threadId,
      reactions,
      reactedBy,
      attachments: attachments.length ? attachments : undefined,
      meta,
    });

    report.accepted++;
  }

  // ===== Dedupe within incoming =====
  // - keep_last: item later overrides earlier
  // - keep_first: first wins
  const seen = new Map();
  if (dedupe === 'keep_first') {
    for (const item of cleaned) {
      if (seen.has(item.id)) {
        report.duplicates++;
        continue;
      }
      seen.set(item.id, item);
    }
  } else {
    // keep_last
    for (const item of cleaned) {
      if (seen.has(item.id)) report.duplicates++;
      seen.set(item.id, item);
    }
  }
  const deduped = Array.from(seen.values());

  // ===== Apply mode =====
  if (mode === 'replace') {
    // Replace entire store with deduped
    messages.length = 0;
    messages.push(...deduped);

    // Enforce cap: keep newest by ts
    messages.sort((a, b) => (Date.parse(a.ts) || 0) - (Date.parse(b.ts) || 0));
    if (messages.length > MAX_CAP) {
      messages.splice(0, messages.length - MAX_CAP);
    }

    report.imported = messages.length;
  } else {
    // merge mode: insert new, update existing by id
    const byId = new Map();
    for (const m of messages) byId.set(m.id, m);

    for (const item of deduped) {
      const existing = byId.get(item.id);
      if (!existing) {
        messages.push(item);
        byId.set(item.id, item);
        report.imported++;
      } else {
        // Update fields (prefer incoming when defined)
        // NOTE: text/user/ts are always present in item
        const prevTs = existing.ts;

        existing.user = item.user ?? existing.user;
        existing.text = item.text ?? existing.text;
        existing.ts = item.ts ?? existing.ts;

        // Optional fields (only overwrite if incoming is not undefined)
        if (item.editedAt !== undefined) existing.editedAt = item.editedAt;
        if (item.deleted !== undefined) existing.deleted = item.deleted;
        if (item.deletedAt !== undefined) existing.deletedAt = item.deletedAt;
        if (item.pinned !== undefined) existing.pinned = item.pinned;
        if (item.pinnedAt !== undefined) existing.pinnedAt = item.pinnedAt;
        if (item.tags !== undefined) existing.tags = item.tags;
        if (item.replyTo !== undefined) existing.replyTo = item.replyTo;
        if (item.threadId !== undefined) existing.threadId = item.threadId;
        if (item.reactions !== undefined) existing.reactions = item.reactions;
        if (item.reactedBy !== undefined) existing.reactedBy = item.reactedBy;
        if (item.attachments !== undefined) existing.attachments = item.attachments;
        if (item.meta !== undefined) existing.meta = { ...(existing.meta || {}), ...(item.meta || {}) };

        // Optional: keep the latest ts if somehow decreased
        // Here: do nothing. If you want enforce monotonic:
        // if (Date.parse(existing.ts) < Date.parse(prevTs)) existing.ts = prevTs;

        report.updated++;
      }
    }

    // Enforce cap: keep newest by ts
    messages.sort((a, b) => (Date.parse(a.ts) || 0) - (Date.parse(b.ts) || 0));
    if (messages.length > MAX_CAP) {
      messages.splice(0, messages.length - MAX_CAP);
    }
  }

  // ===== Return detailed report =====
  return res.json({
    ok: true,
    report,
    summary: {
      storeSize: messages.length,
      imported: report.imported,
      updated: report.updated,
      skipped: report.skipped,
      duplicates: report.duplicates,
      mode: report.mode,
      dedupe: report.dedupe,
      maxCap: report.maxCap,
    },
  });
});


});


