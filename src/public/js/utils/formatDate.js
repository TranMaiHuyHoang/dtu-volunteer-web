/**
 * HÀM CỐT LÕI: Chuyển đổi ISO sang các thành phần Ngày/Tháng/Năm (Sử dụng UTC)
 */
function getDateComponents(isoString) {
    if (!isoString) return null;

    const dateObject = new Date(isoString);
    if (isNaN(dateObject.getTime())) {
        console.error("Đầu vào không phải là ngày tháng hợp lệ:", isoString);
        return null;
    }

    // Luôn sử dụng UTC để đảm bảo chỉ lấy ngày tháng đã lưu (loại bỏ ảnh hưởng của múi giờ cục bộ)
    const day = String(dateObject.getUTCDate()).padStart(2, '0');
    const month = String(dateObject.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObject.getUTCFullYear();
    
    return { day, month, year };
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

// ----------------------------------------------------
// HÀM 2: Định dạng YYYY-MM-DD (Input Type="date")
// ----------------------------------------------------
function formatDateForInput(isoString) {
    const components = getDateComponents(isoString);
    if (!components) return '';

    return `${components.year}-${components.month}-${components.day}`;
}

export {  formatIsoToDDMMYYYY, formatDateForInput};