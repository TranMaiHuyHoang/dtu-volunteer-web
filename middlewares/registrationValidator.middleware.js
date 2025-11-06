const { projectIdRules } = require('./registrationValidationRules.middleware');

// Validator cho đăng ký dự án
const registerForProjectValidator = [
    ...projectIdRules,
];

module.exports = {
    registerForProjectValidator,
};

