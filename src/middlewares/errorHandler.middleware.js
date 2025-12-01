const errorHandler = (err, req, res, next) => {
    console.error('💥 Error:', err);
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi máy chủ nội bộ.';
    let errors = undefined; // Thêm trường errors để trả về chi tiết nếu cần

    // 💡 KHẮC PHỤC LỖI MOONGOSE VALIDATION (SẼ TRẢ VỀ 400)
    if (err.name === 'ValidationError') {
        statusCode = 400;

        // 1. Trích xuất chi tiết lỗi
        errors = Object.values(err.errors).map(el => ({
            path: el.path,
            type: el.kind,
            message: el.message
        }));

        // 2. Cải thiện thông báo chính (message)
        // Lấy thông báo lỗi đầu tiên để làm message chính
        if (errors.length > 0) {
            // **KHUYẾN NGHỊ:** Đặt message chính là lỗi đầu tiên, còn tất cả chi tiết nằm trong 'errors'
            message = errors[0].message;
        } else {
            message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường đã gửi.';
        }
    }

    // Trả về JSON thống nhất
    res.status(statusCode).json({
        status: 'error',
        message,
        // Chỉ thêm errors nếu nó tồn tại
        ...(errors && { errors }),
    });
};
// const errorHandler = (err, req, res, next) => {
//     console.error('💥 Error:', err);

//     const statusCode = err.statusCode || 500;
//     const message = err.message || 'Lỗi máy chủ nội bộ.';

//     // Trả về JSON thống nhất
//     res.status(statusCode).json({
//         status: 'error',
//         message,
//     });
// };
export default
    errorHandler;
