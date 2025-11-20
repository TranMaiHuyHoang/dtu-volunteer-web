import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;
// const apiVersion = process.env.API_VERSION || 'v1';
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
// const apiUrl = `${baseUrl}/api/${apiVersion}`;

// const apiUrl = baseUrl;  //bổ sung version trong tương lai nếu cần

const urlConfig = {
    baseUrl,
};

export default urlConfig;