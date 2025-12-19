function getActivity() {
    // Function implementation goes here
    return "Activity data";
}

function hoang() {
    console.log("This is the hoang module.");
}

function newFunction() {
    console.log("This is a new function.");
}

module.exports = {
    getActivity,
    hoang,
    newFunction
};

function unusedFunction() {
    console.log("This function is not used.");
}
function searchActivities(keyword) {
    const activities = [
        {
            id: "A001",
            title: "Dạy học cho trẻ em vùng cao",
            location: "Hòa Vang",
            organizer: "CLB Tình Nguyện DTU",
            status: "open"
        },
        {
            id: "A002",
            title: "Dọn rác bãi biển",
            location: "Sơn Trà",
            organizer: "Đoàn Thanh Niên",
            status: "open"
        },
        {
            id: "A003",
            title: "Hiến máu nhân đạo",
            location: "Cơ sở 254 Nguyễn Văn Linh",
            organizer: "Hội Chữ Thập Đỏ",
            status: "closed"
        }
    ];

    // Nếu không nhập từ khóa → trả về tất cả
    if (!keyword || keyword.trim() === "") {
        return activities;
    }

    const lowerKeyword = keyword.toLowerCase();

    return activities.filter(activity =>
        activity.title.toLowerCase().includes(lowerKeyword) ||
        activity.location.toLowerCase().includes(lowerKeyword) ||
        activity.organizer.toLowerCase().includes(lowerKeyword)
    );
}
module.exports.searchActivities = searchActivities;

function registerActivity(userId, activityId) {
    return {
        message: "Đăng ký tham gia thành công",
        userId,
        activityId,
        status: "pending"
    };
}
module.exports.registerActivity = registerActivity;

function approveActivityRegistration(registrationId) {
    return {
        message: "Phê duyệt đăng ký thành công",
        registrationId,
        status: "approved"
    };
}