
const express = require('express');
const router = express.Router();
const { handleRegister, handleLogin, googleCallback, handleLogout } = require('../controllers/auth.controller');

const { loginValidator, registerValidator } = require('../middlewares/authValidator.middleware');
const handleValidationErrors = require('../middlewares/validationHandler.middleware');
const myPassport = require('../utils/passportConfig');
const {preLogoutLog} = require('../middlewares/logout.middleware');
const { serveStaticPage } = require('../utils/serveStaticPage');

// Register a new user
router.get("/", serveStaticPage('index.html'));
router.get("/login", serveStaticPage('login.html'));
router.get("/register", serveStaticPage('register.html'));
router.get("/logout-page", serveStaticPage('logout.html'));


router.get("/auth/google", myPassport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/auth/google/callback",
  myPassport.authenticate('google', {
    failureRedirect: "/",
    failureFlash: true, // Enable flash messages
    session: false // Vô hiệu hóa việc tạo session của Passport.js.
      // Không tạo session của Passport (stateless authentication).
      // Dùng khi ứng dụng quản lý đăng nhập bằng JWT
      // hoặc cơ chế xác thực phi trạng thái khác thay vì session trên server.
  }), googleCallback);

router.post('/register', registerValidator, handleValidationErrors, handleRegister);

//Login user
router.post('/login', loginValidator, handleValidationErrors, handleLogin);



router.get("/logout", 
    preLogoutLog,           // 1. Ghi log trước khi bắt đầu và lấy context
    handleLogout
);



module.exports = router;