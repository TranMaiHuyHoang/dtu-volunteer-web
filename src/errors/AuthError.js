import { CustomError } from './customError.js';

class AuthError extends CustomError {
    constructor(message, statusCode = 401) {
        super(message, statusCode);
    }
}

export { AuthError };
export default AuthError;