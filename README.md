# dtu-volunteer-web
Capstone Project 1  - DTU Volunteer Web Platform

## 🛠️ Yêu cầu Cài đặt (Prerequisites)

Để phát triển dự án, bạn cần cài đặt các công cụ sau:

1.  **Node.js & npm:** (Khuyến nghị phiên bản v18 trở lên).
2.  **Git:** Hệ thống quản lý phiên bản.
3.  **Cơ sở dữ liệu:** Cài đặt MongoDB Local hoặc có tài khoản MongoDB Atlas.

---

## ⚙️ Hướng dẫn Cấu hình Dự án

Phần này hướng dẫn bạn cách thiết lập môi trường phát triển cục bộ (`local development`) và cấu hình các biến môi trường cần thiết.

### Bước 1: Tải về và Cài đặt Phụ thuộc

1.  Clone Repository về máy cục bộ của bạn.

2.  Mở Terminal/Command Prompt trong thư mục gốc của dự án.

3.  Chạy lệnh sau để cài đặt tất cả các thư viện cần thiết:

    ```bash
    npm install
    # hoặc yarn install
    ```

### Bước 2: Thiết lập Biến Môi trường An toàn 🔒

Chúng ta sử dụng file **`.env`** để lưu trữ các thông tin bí mật và khóa API.

1.  **Tạo File Cấu hình:**
    Sao chép tệp mẫu **`.env.example`** và đổi tên thành **`.env`**

2.  **Điền Giá trị:**
    Mở tệp `.env` vừa tạo và điền các thông số cấu hình. Đây là các biến **bắt buộc**:

    | Tên Biến Môi Trường | Mục đích | Giá trị Mẫu |
    | :--- | :--- | :--- |
    | **`PORT`** | Cổng chạy server cục bộ. | `3000` |
    | **`DB_CONNECTION_STRING`** | Chuỗi kết nối đến cơ sở dữ liệu MongoDB. | `mongodb://localhost:27017/capstone_db` |
    | **`OAUTH_CLIENT_ID`** | ID Client OAuth 2.0 của nhóm. | `1234567890-abcdefg.apps.googleusercontent.com` |
    | **`OAUTH_CLIENT_SECRET`** | **MẬT MÃ BÍ MẬT NHẤT.** Secret của Client ID OAuth 2.0. | **Phải nhận từ Trưởng nhóm!** (Ví dụ: `GOCSPX-ABCdEfGhIjK_lMnoP`) |

> 🛑 **CẢNH BÁO BẢO MẬT QUAN TRỌNG:**
>
> 1.  **KHÔNG CÓ SECRET TRÊN GITHUB:** Tệp **`.env`** chứa các thông tin bí mật và đã được thêm vào `.gitignore`. **Tuyệt đối không** chia sẻ nội dung của tệp này trên GitHub.
> 2.  **Cách lấy Secret:** Vui lòng liên hệ với Trưởng nhóm/Quản lý dự án để nhận chuỗi **`OAUTH_CLIENT_SECRET`** qua một kênh an toàn (ví dụ: tin nhắn riêng, email).

### Bước 3: Khởi chạy Ứng dụng

Sử dụng lệnh sau để khởi động server phát triển cục bộ:

```bash
npm run dev hoặc npm run start
Server sẽ chạy tại địa chỉ: http://localhost:<PORT> (Ví dụ: http://localhost:3000)

Nếu ứng dụng chạy thành công, bạn sẽ thấy thông báo Server is running at port [PORT] trong terminal.