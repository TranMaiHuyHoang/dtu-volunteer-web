// import pkg from 'jsonwebtoken';
// const { sign } = pkg;
import jwt from 'jsonwebtoken';
// Đảm bảo tải biến môi trường
import 'dotenv/config';

// Lấy JWT_SECRET và JWT_EXPIRES_IN từ biến môi trường (nhất quán với decodeTokenPayload.js)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        JWT_SECRET,
        {
            expiresIn: JWT_EXPIRES_IN,
            algorithm: 'HS256'
        }
    );
};


export default generateAccessToken;