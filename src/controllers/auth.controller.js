import { registerUser, loginUser, loginWithGoogle } from '../services/authService.js';
import logger from '../config/logger.js';
const { info, error: _error, debug } = logger;
import { successfulLogoutLog } from '../middlewares/logout.middleware.js';
import { setAccessTokenCookie, clearAccessTokenCookie } from '../utils/authCookie.js';
const handleRegister = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        info(`Bắt đầu đăng ký tài khoản mới với email: ${email}`);
        
        const user = await registerUser(username, email, password);
        info(`Đăng ký thành công cho người dùng: ${email}`);

        res.status(201).json({
            status: 'success',
            message: 'Đăng ký người dùng thành công.',
            data: user
        });
    } catch (error) {
        _error(`Lỗi đăng ký: ${error.message}`, { 
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
        info(`Yêu cầu đăng nhập từ email: ${email}`);
        const result = await loginUser(email, password);

        if (!result || !result.user) {
            throw new Error('loginUser() trả về không có user.');
        }

        const { user: userData, token } = result;
        info(`Đăng nhập thành công: ${email}`);
        info(`RAW LOGIN RESULT: ${JSON.stringify(userData, null, 2)}`); // bắt buộc in rõ object

        const userId = userData.id;
        
        // req.session.userId = userData.id;
        
        req.session.userId = userId;


        // Lưu token vào cookie (httpOnly, secure)
        setAccessTokenCookie(res, token);
        
        debug(`Session ID sau đăng nhập: ${req.session.id} cho User ID: ${userData.id}`);
        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công.',
            token, // Trả về token trong body để REST client có thể test (web app không cần, đã có cookie)
            user: userData
        });
    } catch (error) {
        _error(`Lỗi đăng nhập: ${error.message}`, {
            error: error.stack,
            email: req.body.email
        });
        next(error);
    }
};

const googleCallback = async (req, res, next) => {
  try {
    const { user: userData, token } = await loginWithGoogle(req.user);
    info(`Đăng nhập thành công qua Google: ${userData.email}`);
    
    // Lưu token vào cookie
    setAccessTokenCookie(res, token);
    
    const userId = userData.id;
    // Tạo session với userId (để logout)
    // req.session.userId = userData.id;
    req.session.userId = userId;
    debug(`Session được tạo: User ID: ${userData.id} | Session ID: ${req.session.id}`);
    
    // Redirect thẳng về trang chủ (không cần trang success trung gian)
    res.redirect('/?login=success');
  } catch (error) {
    _error(`Lỗi đăng nhập qua Google: ${error.message}`, {
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
            _error(`Lỗi khi hủy session ${sessionIdToLog} cho User ${userIdToLog}: ${err.message}`);
            // Nếu có lỗi khi hủy session, đính kèm context và chuyển lỗi
            err.logoutContext = req.logoutContext; 
            return next(err); // Chuyển sang postLogoutLog (Error Handler)
        }

        successfulLogoutLog(req, res, next);
    });
};

export { handleRegister, handleLogin, googleCallback, handleLogout };
