import { Router } from 'express';
const router = Router();
import { handleRegister, handleLogin, googleCallback, handleLogout } from '../controllers/auth.controller.js';

import { loginValidator, registerValidator } from '../middlewares/authValidator.middleware.js';
import handleValidationErrors from '../middlewares/validationHandler.middleware.js';
import passport from '../utils/passportConfig.js';
import { preLogoutLog } from '../middlewares/logout.middleware.js';

// SỬA LỖI: Lấy Default Export trực tiếp (vì serveStaticPage là hàm)
import serveStaticPage from '../utils/serveStaticPage.js';
// Bỏ dòng: const { serveStaticPage } = pageUtils; 

// Register a new user
router.get("/", serveStaticPage('index.html'));
router.get("/login", serveStaticPage('login.html'));
router.get("/register", serveStaticPage('register.html'));
router.get("/logout-page", serveStaticPage('logout.html'));


// SỬA LỖI: Gọi passport.authenticate
router.get("/auth/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/auth/google/callback",
    passport.authenticate('google', {
        failureRedirect: "/",
        failureFlash: true,
        session: false 
    }), googleCallback);

router.post('/register', registerValidator, handleValidationErrors, handleRegister);

//Login user
router.post('/login', loginValidator, handleValidationErrors, handleLogin);


router.get("/logout", 
    preLogoutLog,
    handleLogout
);


export default router;