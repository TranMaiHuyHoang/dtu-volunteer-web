const sampleActivities = [
    {
        // ===== BACKEND FIELDS (Theo ERD) =====
        _id: "A001",
        user_id: 101,
        hours: 4,   // Số giờ tham gia hoạt động
        date: "2025-11-15",

        // ===== FRONTEND FIELDS =====
        title: "Dạy tiếng Anh cho trẻ em khó khăn",
        organization: "CLB Giáo dục DTU",
        location: "Huyện Hòa Vang, Đà Nẵng",
        registered: 8,
        capacity: 25,
        categories: ["education"],
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c"
    },

    {
        _id: "A002",
        user_id: 102,
        hours: 5,
        date: "2025-11-20",

        title: "Chiến dịch dọn rác bãi biển",
        organization: "CLB Môi trường Xanh DTU",
        location: "Bãi biển Mỹ Khê, Đà Nẵng",
        registered: 15,
        capacity: 50,
        categories: ["environment"],
        status: "upcoming",
        image: "https://static.laodong.vn/storage/newsportal/2023/6/4/1200796/_DSC2296.JPG"
    },

    {
        _id: "A003",
        user_id: 103,
        hours: 3,
        date: "2025-11-21",

        title: "Sự kiện khám sức khỏe cộng đồng",
        organization: "CLB Y tế DTU",
        location: "Trung tâm cộng đồng Thanh Khê",
        registered: 12,
        capacity: 30,
        categories: ["health"],
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
    },

    {
        _id: "A004",
        user_id: 104,
        hours: 2,
        date: "2025-11-18",

        title: "Hội thảo kỹ năng số cho người cao tuổi",
        organization: "DTU Tech for Good",
        location: "DTU – Cơ sở A",
        registered: 6,
        capacity: 15,
        categories: ["education"],
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
    },

    {
        _id: "A005",
        user_id: 105,
        hours: 4,
        date: "2025-12-01",

        title: "Hoạt động trồng cây xanh",
        organization: "CLB Môi trường Xanh DTU",
        location: "Bán đảo Sơn Trà, Đà Nẵng",
        registered: 22,
        capacity: 40,
        categories: ["environment"],
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1506765515384-028b60a970df"
    }
];

function renderActivityCount(total) {
    const countEl = document.getElementById("activity-count");
    countEl.textContent = `${total} activities found`;
}

function renderActivities(list) {
    const container = document.getElementById("activity-list");
    container.innerHTML = ""; // clear trước khi render

    list.forEach(act => {
        const html = `
      <article class="rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm">

        <!-- Hình ảnh -->
        <img src="${act.image}"
             alt="${act.title}"
             class="h-40 w-full object-cover" />

        <!-- Nội dung -->
        <div class="p-4">

          <!-- Title -->
          <h3 class="text-base font-semibold text-neutral-900">${act.title}</h3>
          <p class="text-xs text-neutral-500 mt-1">${act.organization}</p>

          <!-- Date -->
          <p class="text-xs mt-3 text-neutral-600 flex items-center gap-1">
            <i class="fa fa-calendar"></i> ${act.date}
          <!-- Hours -->
          <p class="text-xs mt-1 text-neutral-600 flex items-center gap-1">
            <i class="fa" style="font-size: 13px">&#xf017;</i> ${act.hours} giờ
          </p>

          <p class="text-xs mt-1 text-neutral-600 flex items-center gap-1">
            <i class="fa fa-clock-o"></i> ${act.hours} giờ
          </p>
          <!-- Location -->
          <p class="text-xs mt-1 text-neutral-600 flex items-center gap-1">
            <i class="fa fa-map-marker"></i> ${act.location}
          </p>

          <!-- Slots -->
          <p class="text-xs mt-2 text-neutral-700">
            <strong>${act.registered}</strong> / ${act.capacity} spots available
          </p>

          <!-- Button -->
          <button class="mt-4 w-full rounded-lg bg-neutral-900 text-white py-2 text-sm font-medium hover:bg-neutral-800">
            Register Now
          </button>

        </div>
      </article>
    `;

        container.insertAdjacentHTML("beforeend", html);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderActivityCount(sampleActivities.length);
    renderActivities(sampleActivities);
});