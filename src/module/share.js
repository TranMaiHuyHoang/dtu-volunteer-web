// share.simple.js
const SHARE_KEY = "shares";

/* Share nội dung */
function shareContent(username, content) {
    const shares = JSON.parse(localStorage.getItem(SHARE_KEY)) || [];

    shares.push({
        id: Date.now(),
        username,
        content,          // link / text / event
        createdAt: new Date().toISOString()
    });

    localStorage.setItem(SHARE_KEY, JSON.stringify(shares));
}

/* Lấy danh sách share */
function getShares() {
    return JSON.parse(localStorage.getItem(SHARE_KEY)) || [];
}

export { shareContent, getShares };
