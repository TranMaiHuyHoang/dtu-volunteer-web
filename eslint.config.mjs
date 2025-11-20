import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    // Áp dụng cho tất cả các file JS
    files: ["**/*.{js,mjs,cjs}"], 
    
    // Khởi tạo các cấu hình chung
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      // Bật Node và Browser globals
      globals: {...globals.browser, ...globals.node},
      // Hỗ trợ cú pháp JS hiện đại
      ecmaVersion: "latest", 
      // Mặc định là ESM cho các file .js, .mjs (Quan trọng!)
      sourceType: "module" 
    },
    
    // Thêm các quy tắc riêng của bạn tại đây (ví dụ: thụt lề, dấu chấm phẩy)
    rules: {
        'no-console': 'off', // Cho phép dùng console.log trong dev
        'no-unused-vars': ['error', { argsIgnorePattern: '^_|next' }], // Cho phép biến không dùng có tiền tố _ hoặc là next
        'semi': ['error', 'always'],

        // <--- THÊM QUY TẮC NÀY VÀO ĐÂY --->
        'no-irregular-whitespace': ['error', {
            // Cho phép các khoảng trắng không chuẩn trong comment
            skipComments: true, 
            // Vẫn kiểm tra string, regex, template literal, v.v.
            skipRegExps: false, 
            skipTemplates: false,
            skipStrings: false,
        }],
        
    }
  },

  // 1. Ghi đè cho file .cjs: Cần chạy như CommonJS (nếu có)
  { 
    files: ["**/*.cjs"], 
    languageOptions: { 
      sourceType: "commonjs" 
    } 
  },
  
  // 2. Ghi đè cho file .mjs: (Không cần thiết vì đã đặt mặc định là module, nhưng để rõ ràng)
  { 
    files: ["**/*.mjs"], 
    languageOptions: { 
      sourceType: "module" 
    } 
  },
  
  // Xóa bỏ cấu hình cũ: 
  // Bỏ { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } }
  // Vì giờ ta muốn .js là modules.
]);

// import js from "@eslint/js";
// import globals from "globals";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { 
//     files: ["**/*.{js,mjs,cjs}"], 
//     plugins: { js }, 
//     extends: ["js/recommended"], 
//     languageOptions: { globals: {...globals.browser, ...globals.node} } 
//   },
//   // .js files are CommonJS (default in package.json with "type": "commonjs")
//   { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
//   // .mjs files are ESM modules
//   { files: ["**/*.mjs"], languageOptions: { sourceType: "module" } },
//   // .cjs files are explicitly CommonJS
//   { files: ["**/*.cjs"], languageOptions: { sourceType: "commonjs" } },
// ]);
