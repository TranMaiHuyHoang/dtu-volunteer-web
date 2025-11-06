# Hướng dẫn sử dụng Hybrid ESM/CommonJS

Dự án này hỗ trợ cả **CommonJS** (`.js`) và **ES Modules** (`.mjs`) đồng thời.

## Cấu hình

### Package.json
- `"type": "commonjs"` - Đảm bảo các file `.js` được xử lý như CommonJS
- Files `.mjs` tự động được xử lý như ESM modules

### ESLint
ESLint đã được cấu hình để hỗ trợ cả hai loại:
- `.js` files → CommonJS (`sourceType: "commonjs"`)
- `.mjs` files → ESM (`sourceType: "module"`)
- `.cjs` files → CommonJS (explicit)

## Cách sử dụng

### 1. CommonJS (.js files) - Hiện tại

```javascript
// utils/example.js
const express = require('express');
const { formatDate } = require('./helpers.js');

module.exports = {
  formatDate,
};
```

### 2. ESM Modules (.mjs files) - Mới

```javascript
// utils/example.mjs
import express from 'express';
import { formatDate } from './helpers.mjs';

export const formatDate = (date) => {
  // ...
};

export default { formatDate };
```

### 3. Import ESM từ CommonJS

Bạn có thể import ESM modules từ CommonJS files bằng `dynamic import()`:

```javascript
// controllers/example.controller.js (CommonJS)
const exampleHandler = async (req, res) => {
  // Dynamic import ESM module
  const { formatDate } = await import('../utils/example.mjs');
  
  const formatted = formatDate(new Date());
  res.json({ date: formatted });
};
```

### 4. Import CommonJS từ ESM

```javascript
// utils/example.mjs
import express from 'express';
// Import CommonJS module
import createRequire from 'module';
const require = createRequire(import.meta.url);
const logger = require('../config/logger.js');

export const example = () => {
  logger.info('Using CommonJS logger from ESM');
};
```

## Quy tắc

### ✅ Làm được
- Sử dụng `.js` cho CommonJS (giữ nguyên code hiện tại)
- Sử dụng `.mjs` cho ESM modules mới
- Import ESM từ CommonJS bằng `await import()`
- Import CommonJS từ ESM bằng `createRequire()`

### ❌ Không nên
- Không đổi extension `.js` thành `.mjs` cho code hiện tại
- Không mix syntax trong cùng một file
- Không dùng `require()` trong `.mjs` files
- Không dùng `import` trong `.js` files (trừ dynamic import)

## Ví dụ thực tế

### Tạo utility mới bằng ESM

```javascript
// utils/validation.mjs
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};
```

### Sử dụng trong CommonJS controller

```javascript
// controllers/auth.controller.js
const register = async (req, res) => {
  // Import ESM module
  const { validateEmail, validatePassword } = await import('../utils/validation.mjs');
  
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  // ...
};
```

## Migration Strategy

1. **Giữ nguyên code hiện tại** - Tất cả `.js` files vẫn là CommonJS
2. **File mới** - Có thể chọn `.mjs` cho ESM nếu muốn
3. **Migration dần dần** - Chuyển từng file khi cần thiết
4. **Không rush** - CommonJS vẫn hoạt động tốt, không cần chuyển hết

## Lợi ích

- ✅ Không phá vỡ code hiện tại
- ✅ Có thể dùng ESM cho code mới
- ✅ Migration dần dần, không cần một lần
- ✅ Hỗ trợ cả hai formats trong cùng project

## Lưu ý

- Node.js version >= 14.0.0 hỗ trợ đầy đủ
- Dynamic import là async, nhớ dùng `await`
- Một số tools có thể cần cấu hình thêm (như Jest)

