/**
 * Đảm bảo CSS cần thiết được load
 */
function ensureRequiredCSS() {
    const requiredCSS = ['/css/message.css', '/css/layout.css'];
    requiredCSS.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }
    });
}

/**
 * Đảm bảo layout elements tồn tại (header, footer, main)
 * Tự động tạo nếu chưa có
 */
function ensureLayoutElements() {
    ensureRequiredCSS();
    
    if (!document.querySelector('header')) {
        const header = document.createElement('header');
        document.body.insertBefore(header, document.body.firstChild);
    }
    
    if (!document.querySelector('main')) {
        const main = document.createElement('main');
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        if (header && footer) {
            header.parentNode.insertBefore(main, footer);
        } else if (footer) {
            footer.parentNode.insertBefore(main, footer);
        } else {
            document.body.appendChild(main);
        }
    }
    
    if (!document.querySelector('footer')) {
        const footer = document.createElement('footer');
        document.body.appendChild(footer);
    }
}

/**
 * Load và cập nhật header/footer từ partials
 * Đơn giản: chỉ load nội dung và inject vào tags có sẵn trong HTML
 */
async function loadLayout() {
    ensureLayoutElements();
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
    if (typeof checkAuthStatus === 'undefined' && !document.querySelector('script[src="/js/utils/authUI.js"]')) {
        const script = document.createElement('script');
        script.src = '/js/utils/authUI.js';
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
    if (typeof logout === 'undefined' && !document.querySelector('script[src="/js/utils/auth.js"]')) {
        const script = document.createElement('script');
        script.src = '/js/utils/auth.js';
        document.body.appendChild(script);
    }
}

// Khởi tạo layout sau khi message.js load xong
function initLayout() {
    ensureRequiredCSS();
    
    // Nếu DOM đã sẵn sàng, load ngay; nếu chưa, đợi DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadLayout);
    } else {
        loadLayout();
    }
}

// Load message.js nếu chưa có (phải load trước layout.js)
(function() {
    if (typeof showMessage !== 'undefined') {
        // message.js đã có, tiếp tục
        initLayout();
        return;
    }
    
    // Load message.js
    const script = document.createElement('script');
    script.src = '/js/utils/message.js';
    script.onload = initLayout;
    document.head.appendChild(script);
})();