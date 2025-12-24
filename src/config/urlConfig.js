import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;
// const apiVersion = process.env.API_VERSION || 'v1';
<<<<<<< HEAD
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
=======
const baseUrl = process.env.VITE_BASE_URL || `http://localhost:${port}`;
>>>>>>> 52203030bb34a7492dc04b587052c8ca74182db4
const apiPrefix = process.env.API_PREFIX || '/api/v1';
// const apiUrl = `${baseUrl}/api/${apiVersion}`;
// console.log("test baseUrl: " + baseUrl);
// const apiUrl = baseUrl;  //bổ sung version trong tương lai nếu cần

const urlConfig = {
    baseUrl,
    apiPrefix
};

export default urlConfig;