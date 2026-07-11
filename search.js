/* =====================================================================
   SEARCH — hero suggestions + browse page filtering/sorting
===================================================================== */
function setupHeroSearch() {
    const input = document.getElementById('heroSearch');
    const box = document.getElementById('heroSuggestions');
    const btn = document.getElementById('heroSearchBtn');
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (!q) { box.classList.remove('show'); return; }
        const matches = RESOURCES.filter(r => r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)).slice(0, 6);
        box.innerHTML = matches.length ? matches.map(m => `<div class="suggestion-item" onclick="location.hash='#/resource/${m.id}'"><span>${m.title}</span><span style="color:var(--text-muted)">${m.subject}</span></div>`).join('') : `<div class="suggestion-item">No matches found</div>`;
        box.classList.add('show');
    });
    const go = () => { navigate('#/browse?q=' + encodeURIComponent(input.value.trim())); };
    btn.addEventListener('click', go);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-box')) box.classList.remove('show'); });
}

let browseState = { view: 'grid' };

function applyFilters() {
    const subject = document.getElementById('fSubject').value;
    const category = document.getElementById('fCategory').value;
    const author = document.getElementById('fAuthor').value;
    const type = document.getElementById('fType').value;
    const rating = parseFloat(document.getElementById('fRating').value) || 0;
    const sort = document.getElementById('sortSelect').value;
    const q = document.getElementById('browseSearch').value.trim().toLowerCase();

    let results = RESOURCES.filter(r =>
        (!subject || r.subject === subject) &&
        (!category || r.category === category) &&
        (!author || r.author === author) &&
        (!type || r.type === type) &&
        (parseFloat(r.rating) >= rating) &&
        (!q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q))
    );

    if (sort === 'popular') results.sort((a, b) => b.views - a.views);
    else if (sort === 'recent') results.sort((a, b) => b.dateAdded - a.dateAdded);
    else if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
    else if (sort === 'az') results.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'za') results.sort((a, b) => b.title.localeCompare(a.title));

    const container = document.getElementById('resultsContainer');
    container.className = browseState.view === 'grid' ? 'res-grid' : 'res-list';
    document.getElementById('gridViewBtn').classList.toggle('active', browseState.view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', browseState.view === 'list');
    document.getElementById('resultsCount').textContent = `${results.length} resource${results.length !== 1 ? 's' : ''} found`;

    container.innerHTML = results.length ? results.map(resourceCard).join('') :
        `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">📭</div><h3>No resources found</h3><p>Try changing your search or filters.</p></div>`;
    bindCardEvents(container);
}