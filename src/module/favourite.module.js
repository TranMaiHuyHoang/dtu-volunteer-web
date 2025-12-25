/* ======================
   FAVOURITE MODULE
====================== */

const FAV_KEY = "favourites";

/* ======================
   STORAGE
====================== */
function getAllFavourites() {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || {};
}

function saveAllFavourites(data) {
    localStorage.setItem(FAV_KEY, JSON.stringify(data));
}

/* ======================
   ADD FAVOURITE
====================== */
function addFavourite(username, itemId) {
    if (!username || !itemId) return false;

    const data = getAllFavourites();

    if (!data[username]) {
        data[username] = [];
    }

    if (data[username].includes(itemId)) {
        console.log("Item đã nằm trong favourite");
        return false;
    }

    data[username].push(itemId);
    saveAllFavourites(data);

    console.log("Đã thêm favourite:", itemId);
    return true;
}

/* ======================
   REMOVE FAVOURITE
====================== */
function removeFavourite(username, itemId) {
    const data = getAllFavourites();

    if (!data[username]) return false;

    data[username] = data[username].filter(id => id !== itemId);
    saveAllFavourites(data);

    console.log("Đã xóa favourite:", itemId);
    return true;
}

/* ======================
   CHECK FAVOURITE
====================== */
function isFavourite(username, itemId) {
    const data = getAllFavourites();
    return data[username]?.includes(itemId) || false;
}

/* ======================
   GET USER FAVOURITES
====================== */
function getUserFavourites(username) {
    const data = getAllFavourites();
    return data[username] || [];
}

/* ======================
   TOGGLE FAVOURITE
====================== */
function toggleFavourite(username, itemId) {
    if (!username || !itemId) return false;

    if (isFavourite(username, itemId)) {
        removeFavourite(username, itemId);
        return false;
    } else {
        addFavourite(username, itemId);
        return true;
    }
}

/* ======================
   CLEAR USER FAVOURITES
====================== */
function clearUserFavourites(username) {
    if (!username) return false;

    const data = getAllFavourites();

    if (data[username]) {
        delete data[username];
        saveAllFavourites(data);
        console.log("Đã xóa toàn bộ favourite của", username);
        return true;
    }

    return false;
}

/* ======================
   COUNT USER FAVOURITES
====================== */
function countUserFavourites(username) {
    return getUserFavourites(username).length;
}

/* ======================
   RENDER USER FAVOURITES
====================== */
function renderUserFavourites(username, containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const favourites = getUserFavourites(username);
    container.innerHTML = "";

    if (favourites.length === 0) {
        container.innerHTML = "<p>Chưa có favourite nào</p>";
        return;
    }

    favourites.forEach(itemId => {
        const item = document.createElement("div");
        item.className = "favourite-item";
        item.textContent = `Item ID: ${itemId}`;
        container.appendChild(item);
    });
}

/* ======================
   BIND FAVOURITE BUTTON
====================== */
function bindFavouriteButton(button, username, itemId) {
    if (!button) return;

    button.classList.toggle("active", isFavourite(username, itemId));

    button.addEventListener("click", () => {
        const isFav = toggleFavourite(username, itemId);
        button.classList.toggle("active", isFav);
    });
}

/* ======================
   EXPORT
====================== */
export {
    addFavourite,
    removeFavourite,
    isFavourite,
    getUserFavourites,
    toggleFavourite,
    clearUserFavourites,
    countUserFavourites,
    renderUserFavourites,
    bindFavouriteButton
};
