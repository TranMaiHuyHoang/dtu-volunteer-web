const { usernameRules, emailRules, passwordRules } = require('./authValidationRules');

// 1. Validator Đăng ký
// Register cần username, email, và password
const registerValidator = [
    ...usernameRules,
    ...emailRules,
    ...passwordRules,
];

// 2. Validator Đăng nhập
// Login chỉ cần email và password
const loginValidator = [
    ...emailRules,
    // (Lưu ý: Nếu bạn chọn không kiểm tra độ phức tạp khi Login, bạn có thể tạo một 'simplePasswordRules'
    // nhưng để đảm bảo đồng bộ, chúng ta giữ 'passwordRules' ở đây theo yêu cầu trước đó.)
    ...passwordRules, 
];

module.exports = {
    registerValidator,
    loginValidator,
};

