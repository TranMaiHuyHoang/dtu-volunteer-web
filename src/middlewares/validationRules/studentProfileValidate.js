
import { body } from 'express-validator';

//Full name
export const fullNameRules = [
    body('fullName')
        .isLength({ min: 2, max: 100 }) // Độ dài hợp lý hơn cho tên
        .withMessage('Tên đầy đủ phải từ 2-100 ký tự')
        // Tùy chọn: Sử dụng regex để kiểm tra ký tự nếu cần.
        // Ví dụ: chỉ cấm các ký tự đặc biệt không mong muốn
        .matches(/^[a-zA-Z\sÀ-ỹ']+$/) // Cho phép chữ cái (Latin & Tiếng Việt), dấu cách, dấu nháy đơn
        .withMessage('Tên đầy đủ không hợp lệ') 
];


export const classRules = [
    body('class')
        .optional({ nullable: true, checkFalsy: true }) // Tùy chọn, cho phép null/undefined/rỗng
        .trim()
        // Giả sử Lớp không được quá 50 ký tự
        .isLength({ max: 50 }).withMessage('Tên Lớp không được quá 50 ký tự.')
        // Bạn có thể thêm quy tắc kiểm tra định dạng nếu Lớp có định dạng cụ thể (ví dụ: 'IT20A')
        // .matches(/^[A-Za-z0-9]+$/).withMessage('Tên Lớp không hợp lệ.')
];

export const majorRules = [
    body('major') // Đổi tên trường thành 'major'
        // 1. Bắt buộc: Kiểm tra nó không phải là chuỗi rỗng sau khi trim
        .notEmpty().withMessage('Ngành học là bắt buộc và không được để trống') 
        .trim()
        
        // 2. Độ dài: Giả sử tên Ngành học từ 3 đến 100 ký tự
        .isLength({ min: 3, max: 100 }).withMessage('Ngành học phải từ 3 đến 100 ký tự')
        
        // 3. Định dạng ký tự: Cho phép chữ cái, số, dấu cách, và các ký tự đặc biệt phổ biến trong tên ngành/môn học.
        .matches(/^[a-zA-Z0-9\sÀ-ỹ\-\&\/']+$/) 
        .withMessage('Tên Ngành học không hợp lệ. Chỉ cho phép chữ, số, dấu cách và các ký tự: -, &, /') 
];

export const skillsRules = [
    // 1. Kiểm tra chính mảng 'skills'
    body('skills')
        .optional({ nullable: true }) // Cho phép trường này trống (optional)
        .isArray() // Phải là một mảng
        .withMessage('Kỹ năng phải là một danh sách (mảng).'),
    
    // 2. Kiểm tra các phần tử trong mảng (Sử dụng wildcard '*')
    body('skills.*') // Áp dụng quy tắc cho MỌI phần tử trong mảng 'skills'
        .trim()
        .notEmpty().withMessage('Tên kỹ năng không được để trống.')
        
        // Giới hạn độ dài: Ví dụ 3 đến 50 ký tự cho mỗi kỹ năng
        .isLength({ min: 3, max: 50 }).withMessage('Mỗi kỹ năng phải từ 3 đến 50 ký tự.')
        
        // Định dạng ký tự: Cho phép chữ, số, dấu cách, và các ký hiệu phổ biến (ví dụ: C#, C++, JS)
        .matches(/^[a-zA-Z0-9\sÀ-ỹ\-\#\+\.]+$/) 
        .withMessage('Tên kỹ năng không hợp lệ. Chỉ cho phép chữ, số, dấu cách và các ký tự đặc biệt phổ biến (-, #, +, .).')
];


export const dateOfBirthRules = [
    body('dateOfBirth')
        .trim()
        .notEmpty().withMessage('Ngày sinh là bắt buộc')
        .bail()//Dừng kiểm tra nếu quy tắc trước đó thất bại.	Ngay sau các quy tắc quan trọng như notEmpty() hoặc exists() để tránh hiển thị nhiều lỗi vô nghĩa cho cùng một đầu vào rỗng.
        
        // Dùng isDate() với tùy chọn format. 
        // Strict: true đảm bảo định dạng phải khớp chính xác (ngăn chặn các chuỗi không phải ngày)
        // .isDate({ format: 'MM/DD/YYYY', strictMode: true })
        // .withMessage('Ngày sinh không hợp lệ. Vui lòng nhập theo định dạng MM/DD/YYYY') 

        // 3. Logic Ngày/Tháng: Kiểm tra ngày tháng có tồn tại trong lịch không (ví dụ: 30/02/2025)
        // isDate() đã tự động kiểm tra tính hợp lệ này.

        // 4. Logic thời gian: Kiểm tra ngày sinh không được ở Tương lai
        // Kiểm tra xem ngày sinh có phải là ngày HIỆN TẠI hoặc trong QUÁ KHỨ không.
        // Bạn cần chuyển đổi chuỗi ngày thành đối tượng Date, sau đó so sánh với ngày hiện tại (new Date()).
        // Hàm custom này sẽ chạy sau isDate() nên ta biết nó là một ngày hợp lệ.
        // .custom((value) => {
        //     const date = new Date(value);
        //     // new Date() trong JS có thể có vấn đề với định dạng, nhưng sau isDate, nó thường hoạt động tốt.
        //     // Để an toàn hơn, ta có thể tự phân tích MM/DD/YYYY
            
        //     // Xử lý đơn giản: kiểm tra ngày nhập vào (date) không lớn hơn ngày hiện tại (new Date())
        //     if (date.getTime() > new Date().getTime()) {
        //         throw new Error('Ngày sinh không được là ngày trong tương lai');
        //     }
        //     return true;
        // })
        
        // // 5. Logic tuổi (Tùy chọn): Kiểm tra độ tuổi tối thiểu/tối đa hợp lý
        // // Ví dụ: phải đủ 18 tuổi để đăng ký
        // .custom((value) => {
        //     const dob = new Date(value);
        //     const now = new Date();
        //     const minAge = 18; // Tuổi tối thiểu yêu cầu

        //     // Tính tuổi
        //     let age = now.getFullYear() - dob.getFullYear();
        //     const m = now.getMonth() - dob.getMonth();
        //     if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        //         age--;
        //     }
            
        //     if (age < minAge) {
        //         // Bạn có thể tùy chọn thông báo lỗi:
        //         // throw new Error(`Phải đủ ${minAge} tuổi để đăng ký.`);
        //     }
        //     return true;
        // })
];