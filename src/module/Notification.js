function getUserNotifications(username) {
    const notifications =
        JSON.parse(localStorage.getItem(NOTIFICATION_KEY)) || [];

    return notifications.filter(n => n.username === username);
}

export { createNotification, getUserNotifications };