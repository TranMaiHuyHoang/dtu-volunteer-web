// notification.module.js
const NOTIFICATION_KEY = "notifications";

/* =====================
   Utils
===================== */
function getNotifications() {
    return JSON.parse(localStorage.getItem(NOTIFICATION_KEY)) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications));
}

function generateId() {
    return Date.now() + "_" + Math.random().toString(36).substring(2);
}

/* =====================
   Create notification
===================== */
function createNotification({
    title,
    message,
    toUser = null,   // username
    toRole = null,   // admin / user
    type = "info"    // info | success | warning | error
}) {
    const notifications = getNotifications();

    notifications.push({
        id: generateId(),
        title,
        message,
        toUser,
        toRole,
        type,
        isRead: false,
        createdAt: new Date().toISOString()
    });

    saveNotifications(notifications);
}

/* =====================
   Get notification for current user
===================== */
function getUserNotifications(currentUser) {
    if (!currentUser) return [];

    return getNotifications().filter(n =>
        (!n.toUser || n.toUser === currentUser.username) &&
        (!n.toRole || n.toRole === currentUser.role)
    );
}

/* =====================
   Read / Unread
===================== */
function markAsRead(notificationId) {
    const notifications = getNotifications();
    const noti = notifications.find(n => n.id === notificationId);
    if (!noti) return false;

    noti.isRead = true;
    saveNotifications(notifications);
    return true;
}

function markAllAsRead(currentUser) {
    const notifications = getUserNotifications(currentUser);
    const all = getNotifications();

    notifications.forEach(n => {
        const item = all.find(x => x.id === n.id);
        if (item) item.isRead = true;
    });

    saveNotifications(all);
}

/* =====================
   Count
===================== */
function countUnread(currentUser) {
    return getUserNotifications(currentUser).filter(n => !n.isRead).length;
}

/* =====================
   Delete
===================== */
function deleteNotification(id) {
    let notifications = getNotifications();
    notifications = notifications.filter(n => n.id !== id);
    saveNotifications(notifications);
}

function clearUserNotifications(currentUser) {
    let notifications = getNotifications();
    notifications = notifications.filter(n =>
        n.toUser !== currentUser.username
    );
    saveNotifications(notifications);
}

/* =====================
   System notifications
===================== */
function notifyLogin(username) {
    createNotification({
        title: "Đăng nhập",
        message: `${username} vừa đăng nhập hệ thống`,
        toRole: "admin",
        type: "info"
    });
}

function notifyLogout(username) {
    createNotification({
        title: "Đăng xuất",
        message: `${username} vừa đăng xuất`,
        toRole: "admin",
        type: "info"
    });
}

function notifyPasswordChange(username) {
    createNotification({
        title: "Bảo mật",
        message: `${username} đã thay đổi mật khẩu`,
        toRole: "admin",
        type: "warning"
    });
}

/* =====================
   Demo notification
===================== */
function seedNotification() {
    createNotification({
        title: "Chào mừng",
        message: "Chào mừng bạn đến với hệ thống",
        type: "success"
    });
}

/* =====================
   Export
===================== */
export {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    countUnread,
    deleteNotification,
    clearUserNotifications,
    notifyLogin,
    notifyLogout,
    notifyPasswordChange,
    seedNotification
};
