/* ======================
   USER MODULE
   Author: My Name
====================== */

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const THEME_KEY = "theme";

/* ======================
   DEMO
====================== */
function userDemo() {
    console.log("User module loaded successfully");
}

/* ======================
   STORAGE
====================== */
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ======================
   REGISTER
====================== */
function register(username, password) {
    if (!username || !password) {
        console.error("Username hoặc password không được để trống");
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
    userDemo();
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
    userDemo,
    register,
    login,
    logout,
    getCurrentUser,
    isLoggedIn,
    setTheme,
    loadTheme,
    initUserModule
};
