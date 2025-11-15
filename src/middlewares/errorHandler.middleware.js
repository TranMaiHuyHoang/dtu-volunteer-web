const errorHandler = (err, req, res, next) => {
    console.error('💥 Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Lỗi máy chủ nội bộ.';

    // Trả về JSON thống nhất
    res.status(statusCode).json({
        status: 'error',
        message,
    });
}
export default
    errorHandler;
