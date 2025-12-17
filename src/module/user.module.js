function userDemo() {
    console.log("User demo: This function will be called when user module is loaded");

}

function themUser() {
    console.log("Theme user: This function will be called to apply user theme settings");
}


// Export the userDemo function
export { userDemo };
// user.js

// Danh sách user (demo – có thể thay bằng API)
let users = [];

// Hàm demo
function userDemo() {
    console.log("User demo: User module loaded");
}

// Thêm user (Register)
function themUser(username, password) {
    if (!username || !password) {
        console.error("Username hoặc password không được để trống");
        return false;
    }

    // Kiểm tra trùng username
    const exists = users.some(u => u.username === username);
    if (exists) {
        console.error("Username đã tồn tại");
        return false;
    }

    users.push({
        username: username,
        password: password
    });

    console.log("Đăng ký thành công:", username);
    return true;
}

// Đăng nhập
function dangNhap(username, password) {
    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        console.error("Sai username hoặc password");
        return false;
    }

    console.log("Đăng nhập thành công:", username);
    return true;
}

// Đăng xuất
function dangXuat() {
    console.log("Đã đăng xuất");
}

// Áp dụng theme cho user
function themeUser(theme = "light") {
    console.log(`Áp dụng theme: ${theme}`);
    document.body.setAttribute("data-theme", theme);
}

// Lấy danh sách user (phục vụ debug)
function getUsers() {
    return users;
}

// Export các hàm
export {
    userDemo,
    themUser,
    dangNhap,
    dangXuat,
    themeUser,
    getUsers
};
// user.module.js
const STORAGE_KEY = "users";

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function register(username, password) {
    const users = getUsers();

    if (!username || !password) return false;

    if (users.some(u => u.username === username)) return false;

    users.push({ username, password });
    saveUsers(users);
    return true;
}

function login(username, password) {
    const users = getUsers();
    return users.some(u => u.username === username && u.password === password);
}

export { register, login };
