const authService = require('../services/authService');
const logger = require('../config/logger');
const { successfulLogoutLog } = require('../middlewares/logout.middleware');
const { setAccessTokenCookie, clearAccessTokenCookie } = require('../utils/authCookie');
const handleRegister = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        logger.info(`Bắt đầu đăng ký tài khoản mới với email: ${email}`);
        
        const user = await authService.registerUser(username, email, password);
        logger.info(`Đăng ký thành công cho người dùng: ${email}`);

        res.status(201).json({
            status: 'success',
            message: 'Đăng ký người dùng thành công.',
            data: user
        });
    } catch (error) {
        logger.error(`Lỗi đăng ký: ${error.message}`, { 
            error: error.stack,
            email: req.body.email,
            username: req.body.username
        });
        next(error);
    }
};

const handleLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        logger.info(`Yêu cầu đăng nhập từ email: ${email}`);
        
        const { user: userData, token } = await authService.loginUser(email, password);
        logger.info(`Đăng nhập thành công: ${email}`);
        req.session.userId = userData.id;
        
        // Lưu token vào cookie (httpOnly, secure)
        setAccessTokenCookie(res, token);
        
        logger.debug(`Session ID sau đăng nhập: ${req.session.id} cho User ID: ${userData.id}`);
        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công.',
            token, // Trả về token trong body để REST client có thể test (web app không cần, đã có cookie)
            user: userData
        });
    } catch (error) {
        logger.error(`Lỗi đăng nhập: ${error.message}`, {
            error: error.stack,
            email: req.body.email
        });
        next(error);
    }
};

const googleCallback = async (req, res, next) => {
  try {
    const { user: userData, token } = await authService.loginWithGoogle(req.user);
    logger.info(`Đăng nhập thành công qua Google: ${userData.email}`);
    
    // Lưu token vào cookie
    setAccessTokenCookie(res, token);
    
    // Tạo session với userId (để logout)
    req.session.userId = userData.id;
    logger.debug(`Session được tạo: User ID: ${userData.id} | Session ID: ${req.session.id}`);
    
    // Redirect thẳng về trang chủ (không cần trang success trung gian)
    res.redirect('/');
  } catch (error) {
    logger.error(`Lỗi đăng nhập qua Google: ${error.message}`, {
      error: error.stack,
    });
    next(error);
  }
};


const handleLogout = (req, res, next) => {
    // Xóa accessToken cookie
    clearAccessTokenCookie(res);
    
    req.session.destroy(err => {
        if (err) {
            logger.error(`Lỗi khi hủy session ${sessionIdToLog} cho User ${userIdToLog}: ${err.message}`);
            // Nếu có lỗi khi hủy session, đính kèm context và chuyển lỗi
            err.logoutContext = req.logoutContext; 
            return next(err); // Chuyển sang postLogoutLog (Error Handler)
        }

        successfulLogoutLog(req, res, next);
    });
};

module.exports = { handleRegister, handleLogin, googleCallback, handleLogout };
