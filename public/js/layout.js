/**
 * Tóm tắt: Tải layout, chèn wrapper nếu cần, và cập nhật header/footer.
 */
async function loadLayout() {
    // Kiểm tra xem layout đã được load chưa để tránh chạy lại
    if (window.__layoutLoaded) {
        await updatePartials();
        return;
    }
    
    // 1. Nếu chưa có layout (chưa có header/main), load từ layout.html
    if (!document.querySelector('header') || !document.querySelector('main')) {
        await injectLayoutFromFile();
    }
    
    // 2. Tải và Cập nhật Header & Footer
    await updatePartials();
}

/**
 * Tự động load CSS layout vào head nếu chưa có
 */
function loadLayoutCSS() {
    // Kiểm tra xem đã có link đến layout.css chưa
    const existingLink = document.querySelector('link[href="/css/layout.css"]');
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/layout.css';
        document.head.appendChild(link);
    }
}

/**
 * Load toàn bộ layout từ layout.html, giữ lại title và nội dung trang.
 */
async function injectLayoutFromFile() {
    // Lưu title và nội dung trang hiện tại
    const currentTitle = document.title;
    const { scriptsContent, pageContent } = extractBodyContent();
    
    // Lưu các CSS riêng của trang (không phải message.css hoặc layout.css)
    const customCSS = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
        .filter(link => {
            const href = link.getAttribute('href');
            return href && !href.includes('message.css') && !href.includes('layout.css');
        })
        .map(link => link.outerHTML);
    
    // Load layout.html
    const layoutHTML = await fetch('/layout.html').then(res => res.text());
    const parser = new DOMParser();
    const layoutDoc = parser.parseFromString(layoutHTML, 'text/html');
    
    // Giữ title của trang hiện tại
    layoutDoc.title = currentTitle;
    
    // Thêm CSS riêng của trang vào head
    customCSS.forEach(css => {
        const temp = parser.parseFromString(css, 'text/html');
        const cssLink = temp.querySelector('link');
        if (cssLink) {
            layoutDoc.head.appendChild(cssLink);
        }
    });
    
    // Inject nội dung trang vào main
    const mainElement = layoutDoc.querySelector('main');
    if (mainElement && pageContent) {
        mainElement.innerHTML = pageContent;
    }
    
    // Thay thế head và body
    document.head.innerHTML = layoutDoc.head.innerHTML;
    
    // Lấy scripts từ layout.html để thêm vào body
    const layoutScripts = layoutDoc.body.querySelectorAll('script');
    
    // Thay thế body nhưng giữ lại scripts từ layout.html
    document.body.innerHTML = '';
    
    // Thêm header, main, footer từ layout
    document.body.appendChild(layoutDoc.querySelector('header').cloneNode(true));
    document.body.appendChild(layoutDoc.querySelector('main').cloneNode(true));
    document.body.appendChild(layoutDoc.querySelector('footer').cloneNode(true));
    
    // Thêm scripts từ layout.html (message.js, auth.js, layout.js)
    layoutScripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        if (script.type) newScript.type = script.type;
        document.body.appendChild(newScript);
    });
    
    // Thêm lại scripts riêng của trang (inline scripts)
    scriptsContent.forEach(script => {
        if (!script.src && script.text) {
            // Chỉ thêm inline scripts (scripts riêng của trang)
            const newScript = document.createElement('script');
            newScript.textContent = script.text;
            if (script.type) newScript.type = script.type;
            document.body.appendChild(newScript);
        }
    });
    
    // Đánh dấu đã load layout để tránh chạy lại
    window.__layoutLoaded = true;
}

/**
 * Tách và lưu trữ các thẻ script và nội dung HTML khác từ body.
 * @returns {object} Chứa scriptsContent (mảng object) và pageContent (chuỗi HTML)
 */
function extractBodyContent() {
    const allNodes = Array.from(document.body.childNodes);
    
    // 1. Lưu tất cả script tags
    const scripts = allNodes.filter(node => 
        node.nodeType === 1 && node.tagName === 'SCRIPT'
    );
    const scriptsContent = scripts.map(script => ({
        src: script.src,
        text: script.textContent,
        type: script.type
    }));
    
    // 2. Lưu nội dung (không bao gồm script)
    const contentElements = allNodes.filter(node => 
        node.nodeType === 1 && node.tagName !== 'SCRIPT'
    );
    const pageContent = contentElements.map(el => el.outerHTML).join('');
    
    return { scriptsContent, pageContent };
}

/**
 * Thêm lại các thẻ script đã lưu trữ vào body.
 * @param {Array<object>} scriptsContent Mảng chứa thông tin script.
 */
function restoreScripts(scriptsContent) {
    scriptsContent.forEach(script => {
        const newScript = document.createElement('script');
        
        // Thiết lập thuộc tính
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.text; // Dành cho inline scripts
        }
        if (script.type) {
            newScript.type = script.type;
        }
        
        document.body.appendChild(newScript);
    });
}

// Sử dụng module authUI.js để quản lý authentication UI
// Đảm bảo authUI.js được load trước layout.js

/**
 * Tải và thay thế Header và Footer từ partials.
 */
async function updatePartials() {
    // Tải đồng thời
    const [headerHtml, footerHtml] = await Promise.all([
        fetch('/partials/header.html').then(res => res.text()),
        fetch('/partials/footer.html').then(res => res.text())
    ]);
    
    // Thay thế header
    const headerElement = document.querySelector('header');
    if (headerElement) {
        headerElement.outerHTML = headerHtml;
    }
    
    // Thay thế footer
    const footerElement = document.querySelector('footer');
    if (footerElement) {
        footerElement.outerHTML = footerHtml;
    }
    
    // Tự động load authUI.js nếu chưa có (phải load trước khi sử dụng)
    if (typeof checkAuthStatus === 'undefined' && !document.querySelector('script[src="/js/authUI.js"]')) {
        const authUIScript = document.createElement('script');
        authUIScript.src = '/js/authUI.js';
        // Đợi script load xong trước khi sử dụng
        await new Promise((resolve, reject) => {
            authUIScript.onload = resolve;
            authUIScript.onerror = reject;
            document.body.appendChild(authUIScript);
        });
    }
    
    // Cập nhật hiển thị link đăng nhập/đăng xuất dựa trên session từ server
    // Sử dụng hàm từ authUI.js để render lại header (đã đảm bảo authUI.js được load ở trên)
    if (typeof refreshAuthUI === 'function') {
        await refreshAuthUI();
    }
    
    // Tự động load auth.js nếu chưa có để đảm bảo hàm logout() luôn tồn tại
    // (vì header có link logout cần hàm này)
    if (typeof logout === 'undefined' && !document.querySelector('script[src="/js/auth.js"]')) {
        const authScript = document.createElement('script');
        authScript.src = '/js/auth.js';
        document.body.appendChild(authScript);
    }
}

// Chạy hàm chính khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', loadLayout);