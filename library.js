/* =====================================================================
   FAVORITES / MY LIBRARY / HISTORY (localStorage-backed)
===================================================================== */
let favorites = store.get('ls_favorites', []);
let myLibrary = store.get('ls_library', []);
let recentlyViewed = store.get('ls_recent', []);
let downloadHistory = store.get('ls_downloads', []);

function persistLibrary() {
    store.set('ls_favorites', favorites);
    store.set('ls_library', myLibrary);
    store.set('ls_recent', recentlyViewed);
    store.set('ls_downloads', downloadHistory);
}

function updateFavBadge() { document.getElementById('favBadge').textContent = favorites.length; }

function toggleFavorite(id) {
    const idx = favorites.indexOf(id);
    if (idx > -1) { favorites.splice(idx, 1); toast('Removed from favorites'); }
    else { favorites.push(id); toast('Added to favorites'); }
    persistLibrary(); updateFavBadge();
    document.querySelectorAll(`.fav-btn[data-id="${id}"]`).forEach(b => b.classList.toggle('active', favorites.includes(id)));
}

function addToLibrary(id) {
    if (!myLibrary.includes(id)) { myLibrary.push(id); persistLibrary(); toast('Added to My Library'); }
    else toast('Already in your library');
}

function trackRecentView(id) {
    recentlyViewed = recentlyViewed.filter(r => r !== id);
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, 10);
    persistLibrary();
}

function trackDownload(id) {
    downloadHistory.unshift({ id, date: Date.now() });
    persistLibrary();
    toast('Download started (simulated)');
}