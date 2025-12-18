// user.module.js
const STORAGE_KEY = "users";
const CURRENT_USER_KEY = "current_user";

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
   Register
===================== */
function register(username, password, role = "user") {
    if (!username || !password) {
        console.error("Thiếu username hoặc password");
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
        createdAt: new Date().toISOString()
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

    setCurrentUser(user);
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
   Update password
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

/* =====================
   Delete user
===================== */
function deleteUser(username) {
    let users = getUsers();
    users = users.filter(u => u.username !== username);
    saveUsers(users);
    console.log("Đã xóa user:", username);
}

/* =====================
   Check role
===================== */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

/* =====================
   Export
===================== */
export {
    register,
    login,
    logout,
    updatePassword,
    deleteUser,
    getUsers,
    getCurrentUser,
    isAdmin
};
function setMessage(newMessage) {
  message = newMessage;
}
function printMessage() {
  console.log(message);
}