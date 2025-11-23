import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { URL } from 'url';
import path from 'path';
import urlConfig  from './src/config/urlConfig.js';

const currentDir = fileURLToPath(new URL('.', import.meta.url));
console.log('📁 [CONFIG] Current directory:', currentDir);

const publicDirName = 'src/public';
const absolutePublicDir = resolve(currentDir, publicDirName);
console.log('📂 [CONFIG] Public directory:', absolutePublicDir);
console.log('📂 [CONFIG] Public dir exists:', existsSync(absolutePublicDir));

const htmlFiles = readdirSync(absolutePublicDir)
  .filter(file => file.endsWith('.html'))
  .reduce((acc, file) => {
    const name = file.replace('.html', '');
    acc[name] = resolve(absolutePublicDir, file);
    return acc;
  }, {});

console.log('📄 [CONFIG] HTML files found:', Object.keys(htmlFiles));

const aliasConfig = {
  '@': path.resolve(currentDir, './src'),
  '/js': path.resolve(currentDir, './src/public/js'),
  '/css': path.resolve(currentDir, './src/public/css'),
};

console.log('\n🔗 [CONFIG] Alias configuration:');
Object.entries(aliasConfig).forEach(([key, value]) => {
  console.log(`  ${key} => ${value}`);
  console.log(`  Exists: ${existsSync(value)}`);
});

const layoutPath = path.resolve(currentDir, './src/public/js/layout.js');
console.log('\n📦 [CONFIG] Layout.js path:', layoutPath);
console.log('📦 [CONFIG] Layout.js exists:', existsSync(layoutPath));

export default defineConfig({
  root: publicDirName,  // ✅ SỬA: 'src/public'
  publicDir: 'assets',   // ✅ SỬA: vì root đã là src/public rồi
    // ✅ Thêm plugin debug
  plugins: [
    // {
    // name: 'debug-requests',
    // configureServer(server) {
    //   server.middlewares.use((req, res, next) => {
    //     console.log('📝 [REQUEST]', req.url);
    //     next();
    //   });
    // }
    // },
  ],
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      '/js': path.resolve(currentDir, './src/public/js'),
      '/css': path.resolve(currentDir, './src/public/css'),
      // ❌ XÓA alias notyf - để Vite tự resolve
      // 'notyf': path.resolve(currentDir, './node_modules/notyf'),
    },
  },
  
  optimizeDeps: {
    include: ['notyf'],
  },
  
  build: {
    outDir: '../../dist',  // ✅ SỬA: relative từ src/public
    emptyOutDir: true,
    rollupOptions: {
      input: htmlFiles,
    }
  },
  
  server: {
    port: 5173,
    strictPort: false,  // ✅ SỬA: cho phép port khác nếu bận
    middlewareMode: false,
    proxy: {
      '/api': {
        target: urlConfig.baseUrl,
        changeOrigin: true
      }
    }
  },
  // Cấu hình Vitest
  test: {
    environment: 'node', // Cần thiết để test Node.js API (Express, Mongoose)
    globals: true, // Cho phép sử dụng describe, it, expect mà không cần import
    setupFiles: ['./test/setup.js'], // Tùy chọn: Dùng để kết nối DB trước khi test
    root: './',
    dir: 'test', 
    // Tùy chọn: Đảm bảo các mẫu file test là chính xác
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8', // Tùy chọn: Công cụ tính toán coverage
    }
  },

});