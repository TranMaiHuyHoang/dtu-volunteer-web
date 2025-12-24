/**
 * HÀM CỐT LÕI: Chuyển đổi ISO sang các thành phần Ngày/Tháng/Năm (Sử dụng UTC)
 */
// function getDateComponents(isoString) {
//     if (!isoString) return null;

//     const dateObject = new Date(isoString);
//     if (isNaN(dateObject.getTime())) {
//         console.error("Đầu vào không phải là ngày tháng hợp lệ:", isoString);
//         return null;
//     }

//     // Luôn sử dụng UTC để đảm bảo chỉ lấy ngày tháng đã lưu (loại bỏ ảnh hưởng của múi giờ cục bộ)
//     const day = String(dateObject.getUTCDate()).padStart(2, '0');
//     const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
//     const year = dateObject.getUTCFullYear();
    
//     return { day, month, year };
// }

import { parse, format } from 'date-fns';

function getDateComponents(rawDate) {
    if (!rawDate || typeof rawDate !== 'string') return null;

    // Chỉ lấy phần ngày (YYYY-MM-DD) và bỏ qua T...Z
    const datePart = rawDate.split('T')[0]; // Ví dụ: "2025-02-11"

    const parts = datePart.split('-'); 
    
    if (parts.length !== 3) return null;
    
    return {
        year: parts[0],
        month: parts[1],
        day: parts[2]
    };
}
/**
 * Chuyển đổi chuỗi ngày ISO (ví dụ: "2025-11-27T03:08:28.410Z")
 * sang định dạng dd-mm-yyyy (ví dụ: "27-11-2025") theo giờ địa phương.
 * * @param {string} isoString Chuỗi ngày tháng theo chuẩn ISO 8601.
 * @returns {string} Ngày đã định dạng hoặc chuỗi rỗng nếu đầu vào không hợp lệ.
 */
// function formatIsoToDDMMYYYY(isoString) {
//     if (!isoString) return '';

//     try {
//         const dateObject = new Date(isoString);
        
//         // Kiểm tra tính hợp lệ của đối tượng Date
//         if (isNaN(dateObject.getTime())) {
//             console.error("Đầu vào không phải là ngày tháng hợp lệ:", isoString);
//             return '';
//         }

//         // Lấy các thành phần theo giờ địa phương
//         const day = String(dateObject.getDate()).padStart(2, '0');
//         // Lưu ý: getMonth() trả về 0-11, nên cần +1
//         const month = String(dateObject.getMonth() + 1).padStart(2, '0');
//         const year = dateObject.getFullYear();

//         return `${day}-${month}-${year}`;
//     } catch (e) {
//         console.error("Lỗi khi định dạng ngày tháng:", e);
//         return '';
//     }
// }

// ----------------------------------------------------
// HÀM 1: Định dạng DD-MM-YYYY (Hiển thị)
// ----------------------------------------------------
function formatIsoToDDMMYYYY(isoString) {
    const components = getDateComponents(isoString);
    if (!components) return '';
    
    return `${components.day}-${components.month}-${components.year}`;
}


/**
 * Trích xuất Năm, Tháng, Ngày từ chuỗi ISO (YYYY-MM-DD).
 * @param {string} isoString Chuỗi ngày định dạng YYYY-MM-DD.
 * @returns {{year: string, month: string, day: string} | null}
 */

// ----------------------------------------------------
// HÀM 2: Định dạng YYYY-MM-DD (Input Type="date")
// ----------------------------------------------------
function formatDateForNativeInput(isoString) {
    const components = getDateComponents(isoString);
    if (!components) return '';

    return `${components.year}-${components.month}-${components.day}`;
}

function formatDateForDisplay(isoString) {
    const components = getDateComponents(isoString);
    if (!components) return '';

    // Trả về định dạng DD/MM/YYYY
    return `${components.day}/${components.month}/${components.year}`;
}


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
export {  formatIsoToDDMMYYYY, formatDateForNativeInput as formatDateForInput, formatDateForDisplay, processDateOfBirth};