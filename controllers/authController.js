
const User = require('../models/userModel');
const { verifyPassword } = require('../utils/hash');
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Nếu người dùng đã tồn tại, trả về lỗi 409 Conflict
            return res.status(409).json({ message: 'Người dùng với email này đã tồn tại.' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'Đăng ký người dùng thành công' });
    } catch (error) {
        console.error("Lỗi đăng ký người dùng:", error);
        res.status(500).json({ error: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.' });

    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const foundUser = await User.findOne({ email });
        
        // Thông báo lỗi: Người dùng không tồn tại
        if (!foundUser) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

        const isValid = await verifyPassword(password, foundUser.password);
        
        // Thông báo lỗi: Sai mật khẩu
        if (!isValid) return res.status(401).json({ message: 'Mật khẩu không hợp lệ' });

        // Thông báo thành công: Đăng nhập thành công
        res.status(200).json({ message: 'Đăng nhập thành công', userId: foundUser._id });
    } catch (error) {
        console.error('Login error:', error);
        
        // Thông báo lỗi: Lỗi máy chủ
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

module.exports = { registerUser, loginUser };


