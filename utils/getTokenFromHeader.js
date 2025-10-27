/**
 * Lấy JWT từ header Authorization dạng "Bearer <token>".
 * @param {object} req - Đối tượng request (req) của Express.
 * @returns {string | null} - Token JWT hoặc null nếu không tìm thấy/sai định dạng.
 */
const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        // Trường hợp 1: Header không có hoặc sai định dạng
        console.log('LOG-AUTH: ❌ Thiếu hoặc lỗi Auth Header');
        return null;
    }
    
    // Trường hợp 2: Lấy token thành công
    const token = authHeader.split(' ')[1];
    console.log(`LOG-AUTH: ✅ Token OK (${token.substring(0, 5)}...)`);
    return token;
};
module.exports = {getTokenFromHeader};