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
   EXPORT
====================== */
export {
    addFavourite,
    removeFavourite,
    isFavourite,
    getUserFavourites
};
