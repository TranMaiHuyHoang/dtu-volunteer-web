import {CustomError} from './customError.js'; 

class ApiError extends CustomError {
    constructor(status, message, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

export { ApiError };