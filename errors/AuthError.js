const { CustomError } = require('./customError');

class AuthError extends Error {
    constructor(message, statusCode = 401) {
        super(message, statusCode);
    }
}

module.exports = AuthError;