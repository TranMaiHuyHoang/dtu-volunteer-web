import fetchApi from './utils/fetchApi.js';
import { executeApiCall } from './utils/apiExecutor.js';
import {formatIsoToDDMMYYYY} from './utils/formatDate.js';



// const sampleActivities = [
//     {
//         // ===== BACKEND FIELDS (Theo ERD) =====
//         _id: "A001",
//         user_id: 101,
//         hours: 4,   // Số giờ tham gia hoạt động
//         date: "2025-11-15",

//         // ===== FRONTEND FIELDS =====
//         title: "Dạy tiếng Anh cho trẻ em khó khăn",
//         organization: "CLB Giáo dục DTU",
//         location: "Huyện Hòa Vang, Đà Nẵng",
//         registered: 8,
//         capacity: 25,
//         categories: ["education"],
//         status: "upcoming",
//         image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c"
//     },

//     {
//         _id: "A002",
//         user_id: 102,
//         hours: 5,
//         date: "2025-11-20",

//         title: "Chiến dịch dọn rác bãi biển",
//         organization: "CLB Môi trường Xanh DTU",
//         location: "Bãi biển Mỹ Khê, Đà Nẵng",
//         registered: 15,
//         capacity: 50,
//         categories: ["environment"],
//         status: "upcoming",
//         image: "https://static.laodong.vn/storage/newsportal/2023/6/4/1200796/_DSC2296.JPG"
//     },

//     {
//         _id: "A003",
//         user_id: 103,
//         hours: 3,
//         date: "2025-11-21",

//         title: "Sự kiện khám sức khỏe cộng đồng",
//         organization: "CLB Y tế DTU",
//         location: "Trung tâm cộng đồng Thanh Khê",
//         registered: 12,
//         capacity: 30,
//         categories: ["health"],
//         status: "upcoming",
//         image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
//     },

//     {
//         _id: "A004",
//         user_id: 104,
//         hours: 2,
//         date: "2025-11-18",

//         title: "Hội thảo kỹ năng số cho người cao tuổi",
//         organization: "DTU Tech for Good",
//         location: "DTU – Cơ sở A",
//         registered: 6,
//         capacity: 15,
//         categories: ["education"],
//         status: "upcoming",
//         image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
//     },

//     {
//         _id: "A005",
//         user_id: 105,
//         hours: 4,
//         date: "2025-12-01",

//         title: "Hoạt động trồng cây xanh",
//         organization: "CLB Môi trường Xanh DTU",
//         location: "Bán đảo Sơn Trà, Đà Nẵng",
//         registered: 22,
//         capacity: 40,
//         categories: ["environment"],
//         status: "upcoming",
//         image: "https://images.unsplash.com/photo-1506765515384-028b60a970df"
//     }
// ];

/**
 * Cập nhật giao diện người dùng (UI) bằng cách hiển thị số đếm và danh sách hoạt động.
 * Hàm này tập trung logic rendering lại, tránh lặp lại code.
 * @param {object} result - Kết quả đầy đủ từ API: { data: [...], pagination: {...} }
 */
function updateUIWithResults(result) {
    if (!result || !result.data || !result.pagination) {
        // Xử lý trường hợp dữ liệu rỗng/lỗi
        renderActivityCount(0);
        renderActivities([]);
        console.warn("Dữ liệu trả về không hợp lệ, không thể cập nhật UI.");
        return;
    }

    // 1. Render số lượng
    renderActivityCount(result.pagination.total);
    
    // 2. Render danh sách
    renderActivities(result.data);
    
    // 💡 ĐIỂM CẢI TIẾN: Thêm logic cập nhật pagination UI khác nếu có (ví dụ: số trang)
}


function renderActivityCount(total) {
    const countEl = document.getElementById("activity-count");
    countEl.textContent = `${total} activities found`;
    // Đảm bảo total là số, nếu không có thì mặc định là 0
    const finalTotal = Number(total) || 0; 
    
    // 💡 Cải tiến nhẹ: Xử lý số ít/số nhiều hoặc chỉ cần hiển thị số
    countEl.textContent = `${finalTotal} activities found`;
}

function renderActivities(list) {
    const container = document.getElementById("activity-list");
    container.innerHTML = ""; // clear trước khi render

    list.forEach(act => {
      const imageUrl = act.imageUrl ? act.imageUrl : 'https://placehold.co/600x400?text=No+Image';
      const organizerName = act.organizer?.organizationName ?? 'Organizer not available';
        const html = `
      <article class="rounded-xl overflow-hidden bg-white border border-neutral-200 shadow-sm">

        <!-- Hình ảnh -->
        <img src="${imageUrl}"
             alt="${act.title}"
             class="h-40 w-full object-cover" />

        <!-- Nội dung -->
        <div class="p-4">

          <!-- Title -->
          <h3 class="text-base font-semibold text-neutral-900">${act.title}</h3>
          <p class="text-xs text-neutral-500 mt-1">${organizerName}</p>

          <!-- Date -->
          <p class="text-xs mt-3 text-neutral-600 flex items-center gap-1">
            <i class="fa fa-calendar"></i> ${formatIsoToDDMMYYYY(act.startDate)}
          <!-- Hours -->
          <p class="text-xs mt-1 text-neutral-600 flex items-center gap-1">
            <i class="fa" style="font-size: 13px">&#xf017;</i> ${act.hours} giờ
          </p>
          <!-- Location -->
          <p class="text-xs mt-1 text-neutral-600 flex items-center gap-1">
            <i class="fa fa-map-marker"></i> ${act.location}
          </p>

          <!-- Slots -->
          <p class="text-xs mt-2 text-neutral-700">
            <strong>${act.availableSpots}</strong> / ${act.maxSpots} spots available
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


const setupSearchAndFilterListeners = () => {
    // 🌟 KHÔNG CẦN createFilterHandler nữa. Chỉ cần gọi hàm thực thi
    const handler = executeFilterAndSearch; 

    // Lấy các phần tử
    const searchInputEl = document.getElementById('activity-search-input');
    const categoryFilterEl = document.getElementById('category-filter');
    const statusFilterEl = document.getElementById('status-filter');

    // 1. Gắn sự kiện cho Dropdown (Filter)
    if (categoryFilterEl) {
        categoryFilterEl.addEventListener('change', handler); 
    }
    if (statusFilterEl) {
        statusFilterEl.addEventListener('change', handler); 
    }
    
    // 2. Gắn sự kiện cho Ô tìm kiếm (Search)
    if (searchInputEl) {
        // Sử dụng DEBOUNCE
        const debouncedHandler = debounce(handler, 300); 
        searchInputEl.addEventListener('input', debouncedHandler);
    }
};

/**
 * Thu thập TẤT CẢ các tham số lọc và tìm kiếm từ DOM.
 * @returns {object} Đối tượng chứa các filtersToSend cho API.
 */
function collectSearchAndFilterParams() {
    // 1. Tăng cường tính an toàn khi truy cập DOM
    const searchInputEl = document.getElementById('activity-search-input');
    const statusFilterEl = document.getElementById('status-filter');
    const categoryFilterEl = document.getElementById('category-filter');

    // Lấy giá trị (Sử dụng Optional Chaining và giá trị mặc định)
    const searchInput = searchInputEl?.value || '';
    const statusValue = statusFilterEl?.value || '';
    const categoryValue = categoryFilterEl?.value || '';

    // 2. Tạo đối tượng filters cơ bản
    const filtersToSend = {
        search: searchInput.trim(), 
        page: 1, 
        limit: 10,
    };
    
    // 3. Xử lý logic lọc (Chỉ thêm tham số nếu nó KHÔNG phải là 'all...')

    // Lọc Status
    if (statusValue && statusValue.toLowerCase() !== 'all status') {
        filtersToSend.status = statusValue.toLowerCase().trim(); 
    }

    // Lọc Category
    if (categoryValue && categoryValue.toLowerCase() !== 'all categories') {
        filtersToSend.category = categoryValue.toLowerCase().trim(); 
    }
    return filtersToSend;
}

/**
 * Thực thi cuộc gọi API với các filters đã thu thập và cập nhật UI.
 * Hàm này thay thế phần lõi lặp lại của createFilterHandler và performSearch.
 */
async function executeFilterAndSearch() {
    try {
        // 1. Thu thập tất cả các filters từ DOM
        const filtersToSend = collectSearchAndFilterParams(); 

        // 2. Gọi API
        const result = await fetchActivitiesData(filtersToSend);

        // 3. Cập nhật UI tập trung
        updateUIWithResults(result); 
        
    } catch (error) {
        console.error("Lỗi khi thực hiện Filter/Search:", error);
    }
}

//----------------------------///

/**
 * Chuyển đổi đối tượng filter thành chuỗi truy vấn URL.
 * Ví dụ: { search: 'A', category: 'B' } -> "?search=A&category=B"
 * @param {object} params - Đối tượng chứa các tham số lọc và tìm kiếm.
 * @returns {string} - Chuỗi truy vấn URL, bắt đầu bằng '?' nếu có tham số.
 */
function buildQueryString(params = {}) {
    // Lọc bỏ các giá trị rỗng, null, hoặc undefined
    const validParams = Object.keys(params).filter(key => 
        params[key] !== null && params[key] !== undefined && params[key] !== ''
    );

    if (validParams.length === 0) {
        return '';
    }

    const queryString = validParams
        // Mã hóa key và value để đảm bảo an toàn URL (ví dụ: xử lý khoảng trắng, ký tự đặc biệt)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
        
    return `?${queryString}`;
}


const DEFAULT_PAGINATION = { total: 0, page: 1, totalPages: 0 };

async function fetchActivitiesData(filters = {}) {
    try {
        const queryString = buildQueryString(filters);
        const endpoint = `/activities${queryString}`;
        // Tải dữ liệu từ API
        let mydata = await fetchApi(endpoint, 'GET', null, { useSession: true });
        // Kiểm tra mydata và trả về mảng dữ liệu
        if (mydata && mydata.data) {
            // 🌟 SỬA ĐỔI QUAN TRỌNG NHẤT: Trả về toàn bộ đối tượng mydata
            return {
                data: mydata.data || [],
                // Đảm bảo pagination luôn tồn tại, dùng giá trị đã nhận hoặc mặc định
                pagination: mydata.pagination || DEFAULT_PAGINATION
            };

        }
        
        // Trả về mảng rỗng nếu không có dữ liệu
        // return [];
        return { 
            data: [], 
            pagination: DEFAULT_PAGINATION 
        };
        
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu hoạt động:", error);
        // Trả về cấu trúc mặc định an toàn khi có lỗi mạng
        return { 
            data: [], 
            pagination: DEFAULT_PAGINATION 
        };
    }
}



// ------------------------------------------------------------
// 1. Hàm Tiện ích Debounce
// ------------------------------------------------------------
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

async function initializeApp() {
  
    // 1. Tải dữ liệu bằng hàm đã tách VÀ GÁN VÀO BIẾN MODULE
    const result = await fetchActivitiesData(); // ⭐️ SỬA LỖI 2: Gán giá trị vào biến moduleầu

    updateUIWithResults(result);

    setupSearchAndFilterListeners();

}

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  
});