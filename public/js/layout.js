/**
 * Load và cập nhật header/footer từ partials
 * Đơn giản: chỉ load nội dung và inject vào tags có sẵn trong HTML
 */
async function loadLayout() {
    await updatePartials();
}

/**
 * Extract nội dung bên trong tag từ HTML string
 */
function extractInnerContent(htmlString, tagName) {
    const temp = document.createElement('div');
    temp.innerHTML = htmlString;
    const wrappedElement = temp.querySelector(tagName);
    return wrappedElement ? wrappedElement.innerHTML : htmlString;
}

/**
 * Load và cập nhật header/footer từ partials
 * Đơn giản: load HTML và inject vào tags có sẵn trong trang
 */
async function updatePartials() {
    // Load nội dung header và footer từ partials
    const [headerContent, footerContent] = await Promise.all([
        fetch('/partials/header.html').then(res => res.text()),
        fetch('/partials/footer.html').then(res => res.text())
    ]);
    
    // Inject nội dung vào header/footer (tags đã có sẵn trong HTML)
    const headerElement = document.querySelector('header');
    const footerElement = document.querySelector('footer');
    
    if (headerElement) {
        headerElement.innerHTML = extractInnerContent(headerContent, 'header');
    }
    
    if (footerElement) {
        footerElement.innerHTML = extractInnerContent(footerContent, 'footer');
    }
    
    // Load authUI.js nếu chưa có
    if (typeof checkAuthStatus === 'undefined' && !document.querySelector('script[src="/js/authUI.js"]')) {
        const script = document.createElement('script');
        script.src = '/js/authUI.js';
        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    
    // Cập nhật auth UI
    if (typeof refreshAuthUI === 'function') {
        await refreshAuthUI();
    }
    
    // Load auth.js nếu chưa có (cần cho logout)
    if (typeof logout === 'undefined' && !document.querySelector('script[src="/js/auth.js"]')) {
        const script = document.createElement('script');
        script.src = '/js/auth.js';
        document.body.appendChild(script);
    }
}

// Chạy hàm chính khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', loadLayout);