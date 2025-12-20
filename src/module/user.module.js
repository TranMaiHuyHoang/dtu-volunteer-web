// user.module.js
const STORAGE_KEY = "users";
const CURRENT_USER_KEY = "current_user";
const LOGIN_LOG_KEY = "login_logs";

/* =====================
   Utils
===================== */
function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

function clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

/* =====================
   Validate
===================== */
function validateUsername(username) {
    return username && username.length >= 3;
}

function validatePassword(password) {
    return password && password.length >= 6;
}

/* =====================
   Register
===================== */
function register(username, password, role = "user") {
    if (!validateUsername(username)) {
        console.error("Username phải >= 3 ký tự");
        return false;
    }

    if (!validatePassword(password)) {
        console.error("Password phải >= 6 ký tự");
        return false;
    }

    const users = getUsers();

    if (users.some(u => u.username === username)) {
        console.error("Username đã tồn tại");
        return false;
    }

    users.push({
        username,
        password,
        role,
        createdAt: new Date().toISOString(),
        status: "active"
    });

    saveUsers(users);
    console.log("Đăng ký thành công:", username);
    return true;
}

/* =====================
   Login
===================== */
function login(username, password) {
    const users = getUsers();

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        console.error("Sai thông tin đăng nhập");
        return false;
    }

    if (user.status === "blocked") {
        console.error("Tài khoản bị khóa");
        return false;
    }

    setCurrentUser(user);
    logLogin(username);
    console.log("Đăng nhập thành công:", username);
    return true;
}

/* =====================
   Logout
===================== */
function logout() {
    clearCurrentUser();
    console.log("Đã đăng xuất");
}

/* =====================
   Password
===================== */
function updatePassword(oldPassword, newPassword) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const users = getUsers();
    const user = users.find(u => u.username === currentUser.username);

    if (user.password !== oldPassword) {
        console.error("Mật khẩu cũ không đúng");
        return false;
    }

    user.password = newPassword;
    saveUsers(users);
    setCurrentUser(user);

    console.log("Đổi mật khẩu thành công");
    return true;
}

/* Admin reset password */
function resetPassword(username, newPassword) {
    if (!isAdmin()) return false;

    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return false;

    user.password = newPassword;
    saveUsers(users);
    console.log("Admin reset password cho:", username);
    return true;
}

/* =====================
   Role & Permission
===================== */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

function updateRole(username, role) {
    if (!isAdmin()) return false;

    const users = getUsers();
    const user = users.find(u => u.username === username);
    if (!user) return false;

    user.role = role;
    saveUsers(users);
    console.log("Đã cập nhật role:", username, role);
    return true;
}

/* =====================
   User management
===================== */
function deleteUser(username) {
    let users = getUsers();
    users = users.filter(u => u.username !== username);
    saveUsers(users);
    console.log("Đã xóa user:", username);
}

function findUser(username) {
    return getUsers().find(u => u.username === username);
}

function countUsers() {
    return getUsers().length;
}

/* =====================
   Login log
===================== */
function logLogin(username) {
    const logs = JSON.parse(localStorage.getItem(LOGIN_LOG_KEY)) || [];
    logs.push({
        username,
        time: new Date().toISOString()
    });
    localStorage.setItem(LOGIN_LOG_KEY, JSON.stringify(logs));
}

function getLoginLogs() {
    return JSON.parse(localStorage.getItem(LOGIN_LOG_KEY)) || [];
}

/* =====================
   Guards
===================== */
function requireLogin() {
    if (!getCurrentUser()) {
        alert("Bạn cần đăng nhập");
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!isAdmin()) {
        alert("Không có quyền truy cập");
        return false;
    }
    return true;
}

/* =====================
   Seed admin
===================== */
function seedAdmin() {
    const users = getUsers();
    if (!users.some(u => u.role === "admin")) {
        users.push({
            username: "admin",
            password: "admin123",
            role: "admin",
            createdAt: new Date().toISOString()
        });
        saveUsers(users);
        console.log("Đã tạo admin mặc định");
    }
}

/* =====================
   Message helper (fix lỗi cuối file)
===================== */
let message = "";

function setMessage(newMessage) {
    message = newMessage;
}

function printMessage() {
    console.log(message);
}

/* =====================
   Export
===================== */
export {
    register,
    login,
    logout,
    updatePassword,
    resetPassword,
    deleteUser,
    updateRole,
    getUsers,
    getCurrentUser,
    findUser,
    countUsers,
    isAdmin,
    requireLogin,
    requireAdmin,
    seedAdmin,
    getLoginLogs,
    setMessage,
    printMessage
};
