import { loadMissingStylesheets } from './dom-utils.js';


/**
 * Thiết lập các phần tử cơ bản của trang web
 * Các phần tử này bao gồm header, main và footer
 * 
 * @returns {void} - Không trả về giá trị nào
 */
function setupPageLayoutElements() {
    loadMissingStylesheets();

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
export { setupPageLayoutElements };