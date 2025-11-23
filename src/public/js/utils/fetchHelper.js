// /js/utils/fetchHelper.js (ĐÃ SỬA)

/**
 * Fetch Helper - Low-level DOM utility functions
 * Các hàm tiện ích cơ bản để thao tác với DOM elements
 */

(function(global) {
    'use strict';

    /**
     * Set text content cho element bằng ID
     * @param {string} elementId - ID của element
     * @param {string} content - Nội dung text cần set
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
     */
    function setElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    // Gắn các hàm cần dùng vào Global Scope (window)
    // Ở đây ta dùng tên setElementHTML và setElementContent trực tiếp
    // vì chúng được dùng trong thẻ <script> của bạn.
    global.setElementContent = setElementContent;
    global.setElementHTML = setElementHTML;

})(window); 
