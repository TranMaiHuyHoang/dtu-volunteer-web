/**
 * Fetch Helper - Low-level DOM utility functions
 * Các hàm tiện ích cơ bản để thao tác với DOM elements
 * Tái sử dụng code, tuân thủ nguyên tắc DRY
 */

/**
 * Set text content cho element bằng ID
 * @param {string} elementId - ID của element
 * @param {string} content - Nội dung text cần set
 * 
 * @example
 * setElementContent('profile', 'Loading...');
 */
function setElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

/**
 * Set HTML content cho element bằng ID
 * @param {string} elementId - ID của element
 * @param {string} html - HTML content cần set
 * 
 * @example
 * setElementHTML('list', '<ul><li>Item 1</li></ul>');
 */
function setElementHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = html;
    }
}

// Export cho cả ES6 modules và script tag thông thường
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setElementContent, setElementHTML };
}
// Export cho script tag thông thường
if (typeof window !== 'undefined') {
    window.setElementContent = setElementContent;
    window.setElementHTML = setElementHTML;
}

