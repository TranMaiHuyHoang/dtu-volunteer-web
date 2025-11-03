const User = require('../models/user.model'); // Giả sử model User
const { verifyPassword } = require('../utils/hash');
const { generateAccessToken } = require('../utils/generateAccessToken'); // Hàm tạo JWT
const AuthError = require('../errors/AuthError');
const { mapUserData, formatUserInfo } = require('../utils/userMapper');

const buildAuthResponse = (user, provider = 'local') => {
  const { payload, userInfo } = mapUserData(user, provider);
  const token = generateAccessToken(payload);
  return { token, user: userInfo };
};

/**
 * Xử lý logic đăng ký người dùng mới
 * @param {string} username 
 * @param {string} email 
 * @param {string} password - Mật khẩu chưa hash
 * @returns {object} Thông tin người dùng (không có password hash)
 */
const registerUser = async (username, email, password) => {
    // 1. Kiểm tra người dùng đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        // Ném lỗi 409 Conflict
        throw new AuthError('Người dùng với email này đã tồn tại.', 409);
    }

    const newUser = new User({ 
        username, 
        email, 
        password // Giả định việc hash được xử lý bằng Mongoose Middleware (Pre-save hook)
    });

    // 3. Lưu vào DB
    await newUser.save();
    
    // Loại bỏ password hash trước khi trả về
    newUser.password = undefined; 

    // Trả về dữ liệu người dùng cơ bản
    return {
        user: formatUserInfo(newUser)
    };
};


/**
 * Xử lý logic đăng nhập: tìm user, xác thực, và tạo token.
 * @param {string} email 
 * @param {string} password 
 * @returns {object} { user, token }
 */
const loginUser = async (email, password) => {
    // 1. Tìm người dùng (cần lấy cả password)
    const user = await User.findOne({ email });

    // **Mẹo bảo mật:** Dùng lỗi 401 chung cho cả 2 trường hợp
    if (!user) {
        throw new AuthError('Thông tin đăng nhập không hợp lệ.', 401);
    }

    // 2. Xác thực mật khẩu
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
        throw new AuthError('Thông tin đăng nhập không hợp lệ.', 401);
    }

    return buildAuthResponse(user);
};


const loginWithGoogle = async (googleUser) => {
  if (!googleUser) {
    throw new AuthError('Xác thực không thành công.', 401);
  }

  console.log(`Người dùng ${googleUser.email} đăng nhập thành công và nhận JWT.`);

  const { token, user: userInfo } = buildAuthResponse(googleUser, 'google');
  
  return { token, user: userInfo };
};


module.exports = { 
  registerUser,
  loginUser, 
  loginWithGoogle
};