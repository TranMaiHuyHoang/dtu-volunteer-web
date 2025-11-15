/**
 * Cấu hình cho Auth UI
 * Có thể override bằng cách gán window.AUTH_CONFIG trước khi layout.js chạy
 */

(function initAuthConfig(global) {
  if (!global.AUTH_CONFIG) {
    global.AUTH_CONFIG = {};
  }

  if (!Array.isArray(global.AUTH_CONFIG.authFreePaths)) {
    global.AUTH_CONFIG.authFreePaths = [
      '/login',
      '/register',
      '/logout',
    ];
  }
})(window);

