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
// user.module.js
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const THEME_KEY = "theme";

/* ======================
   USER STORAGE
====================== */

// Lấy danh sách user
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

// Lưu danh sách user
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ======================
   REGISTER
====================== */
function register(username, password) {
    if (!username || !password) {
        console.error("Thiếu username hoặc password");
        return false;
    }

    const users = getUsers();

    if (users.some(u => u.username === username)) {
        console.error("Username đã tồn tại");
        return false;
    }

    users.push({ username, password });
    saveUsers(users);

    console.log("Đăng ký thành công:", username);
    return true;
}

/* ======================
   LOGIN
====================== */
function login(username, password) {
    const users = getUsers();

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        console.error("Sai username hoặc password");
        return false;
    }

    localStorage.setItem(CURRENT_USER_KEY, username);
    console.log("Đăng nhập thành công:", username);
    return true;
}

/* ======================
   LOGOUT
====================== */
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    console.log("Đã đăng xuất");
}

/* ======================
   CURRENT USER
====================== */
function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function isLoggedIn() {
    return !!getCurrentUser();
}

/* ======================
   THEME
====================== */
function setTheme(theme = "light") {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    console.log("Theme đã áp dụng:", theme);
}

function loadTheme() {
    const theme = localStorage.getItem(THEME_KEY) || "light";
    document.body.setAttribute("data-theme", theme);
}

/* ======================
   INIT
====================== */
function initUserModule() {
    loadTheme();

    if (isLoggedIn()) {
        console.log("User đang đăng nhập:", getCurrentUser());
    } else {
        console.log("Chưa có user đăng nhập");
    }
}

/* ======================
   EXPORT
====================== */
export {
    register,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    setTheme,
    loadTheme,
    initUserModule
};
