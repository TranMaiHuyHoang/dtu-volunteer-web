import { statsData } from './stats-data.js';

// Hàm chạy số animation
function animateCountUp(element, targetValue, duration = 800) {
    let start = 0;
    const startTime = performance.now();

    function update(timestamp) {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const value = Math.floor(progress * targetValue);

        element.textContent = value.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

export function renderStats() {
    animateCountUp(document.getElementById('stat-volunteers'), statsData.volunteers);
    animateCountUp(document.getElementById('stat-hours'), statsData.hours);
    animateCountUp(document.getElementById('stat-impacts'), statsData.impacts);
}

document.addEventListener("DOMContentLoaded", renderStats);
