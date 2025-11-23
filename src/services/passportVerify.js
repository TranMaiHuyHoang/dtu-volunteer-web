// passportVerify.js - SỬ DỤNG ESM

// Thay thế require bằng import cho Default Export từ user.model
import User from '../models/user.model.js'; // Đảm bảo thêm .js

/**
 * Hàm Verify Callback cho Passport Google Strategy
 * @param {string} accessToken - Token truy cập Google
 * @param {string} refreshToken - Token làm mới (nếu có)
 * @param {object} profile - Thông tin người dùng từ Google
 * @param {function} done - Hàm callback để báo cáo kết quả cho Passport
 */
const googleVerifyCallback = async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
            return done(null, user);
        }
        // Người dùng mới: Tạo tài khoản
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
            name: profile.displayName, 

            // Thêm kiểm tra an toàn cho profile.emails
            // ... các trường khác
        });
        user = await newUser.save();
        return done(null, user);
    } catch (err) {
    // Xử lý lỗi hệ thống/database
    console.error("Lỗi xác thực Google:", err);
    return done(err, null);
}
};

export default googleVerifyCallback;