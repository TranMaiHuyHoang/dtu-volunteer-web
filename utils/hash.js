const bcrypt = require('bcrypt');
const saltRounds = 10; // Có thể đặt hằng số này ở một file config
const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        // Xử lý lỗi
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password');
    }
};

const verifyPassword = async (inputPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
};

module.exports = { hashPassword, verifyPassword };
