const authService = require('../services/authService');
const logger = require('../config/logger');

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

        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công.',
            token,
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
    const { user : userData, token } = await authService.loginWithGoogle(req.user);
    logger.info(`Đăng nhập thành công qua Google: ${userData.email}`);

    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công, sử dụng token này để xác thực API.',
      token,
      user: userData
    });
  } catch (error) {
    logger.error(`Lỗi đăng nhập qua Google: ${error.message}`, {
      error: error.stack,
    });
    next(error);
  }
};


module.exports = { handleRegister, handleLogin, googleCallback };
