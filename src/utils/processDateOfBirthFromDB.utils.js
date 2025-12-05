

import { parse, format } from 'date-fns';
////------------------BACKEND------------------------
/**
 * Xử lý chuỗi ngày sinh từ frontend (DD/MM/YYYY) và chuẩn hóa thành
 * định dạng lưu trữ an toàn (YYYY-MM-DD) cho database.
 * @param {string | null} dateOfBirth Chuỗi ngày sinh từ request data.
 * @returns {string | null} Chuỗi ngày chuẩn YYYY-MM-DD hoặc null.
 * @throws {Error} Nếu định dạng ngày không hợp lệ.
 */
const processDateOfBirth = (dateOfBirth) => {
    // Nếu giá trị là null, undefined, hoặc rỗng hoàn toàn, trả về null
    if (!dateOfBirth) {
        return null; 
    }

    // Xử lý trường hợp người dùng gửi chuỗi rỗng để xóa giá trị
    if (dateOfBirth === '') {
        return null;
    }

    // 1. Xử lý Parsing (Khắc phục Lỗi #1: Định dạng MM/DD)
    const parsedDate = parse(
        dateOfBirth, 
        'dd/MM/yyyy', // YÊU CẦU: Parse theo định dạng DD/MM/YYYY
        new Date() 
    );

    // 2. Xử lý Lưu trữ (Khắc phục Lỗi #2: Lệch ngày T...Z)
    // Kiểm tra tính hợp lệ của ngày tháng đã parse
    if (!isNaN(parsedDate.getTime())) {
        // Chuyển đổi Date object thành chuỗi chỉ có ngày (YYYY-MM-DD)
        return format(parsedDate, 'yyyy-MM-dd');
    } else {
        // Ném lỗi nếu parsing thất bại
        throw new Error('Định dạng Ngày sinh không hợp lệ sau khi parse.');
    }
};


//----------------------------------------
export { processDateOfBirth};