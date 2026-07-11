/* =====================================================================
   APP — router, page renders, header behavior, toast, reader, entry point
===================================================================== */

/* ---------- TOAST ---------- */
function toast(msg, type = 'success') {
    const wrap = document.getElementById('toastWrap');
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 2600);
}

/* ---------- THEME ---------- */
let theme = store.get('ls_theme', 'light');
function initTheme() {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
    document.getElementById('themeToggle').addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
        store.set('ls_theme', theme);
    });
}

/* ---------- MOBILE NAV ---------- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobilePanel = document.getElementById('mobilePanel');
const overlay = document.getElementById('overlay');
function closeMobile() { mobilePanel.classList.remove('open'); overlay.classList.remove('show'); }
function initMobileNav() {
    hamburgerBtn.addEventListener('click', () => { mobilePanel.classList.add('open'); overlay.classList.add('show'); });
    overlay.addEventListener('click', closeMobile);
    mobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
}

/* ---------- AVATAR DROPDOWN ---------- */
function initAvatarDropdown() {
    document.getElementById('avatarInitial').parentElement.addEventListener('click', () => {
        document.getElementById('userDropdown').classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.avatar-wrap')) document.getElementById('userDropdown').classList.remove('open');
    });
}

/* ---------- BACK TO TOP ---------- */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => { backToTop.classList.toggle('show', window.scrollY > 400); });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- REVEAL / COUNTERS ---------- */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: 0.15 });
function observeReveals(root = document) { root.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); }

function animateCounters(root = document) {
    root.querySelectorAll('[data-counter]').forEach(el => {
        const target = parseInt(el.getAttribute('data-counter'), 10);
        let started = false;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    let cur = 0; const step = Math.max(1, Math.floor(target / 60));
                    const iv = setInterval(() => {
                        cur += step;
                        if (cur >= target) { cur = target; clearInterval(iv); }
                        el.textContent = cur.toLocaleString() + '+';
                    }, 20);
                }
            });
        }, { threshold: 0.3 });
        obs.observe(el);
    });
}

/* ---------- RESOURCE CARD ---------- */
function resourceCard(r) {
    const isFav = favorites.includes(r.id);
    return `
  <div class="res-card">
    <div class="res-cover">${r.icon}
      <button class="fav-btn ${isFav ? 'active' : ''}" data-id="${r.id}" aria-label="Toggle favorite">❤</button>
    </div>
    <div class="res-body">
      <h4>${r.title}</h4>
      <div class="res-meta">by ${r.author} • ${r.year}</div>
      <div class="res-tags"><span class="tag">${r.subject}</span><span class="tag">${r.type}</span></div>
      <div class="res-stats"><span>⭐ ${r.rating}</span><span>👁 ${r.views}</span><span>⬇ ${r.downloads}</span></div>
      <div class="res-actions">
        <button class="btn btn-outline" onclick="location.hash='#/resource/${r.id}'">Details</button>
        <button class="btn btn-primary" onclick="openReader(${r.id})">Read</button>
      </div>
    </div>
  </div>`;
}
function bindCardEvents(root) {
    root.querySelectorAll('.fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(parseInt(btn.dataset.id, 10)); });
    });
}

/* ---------- ROUTER ---------- */
const app = document.getElementById('app');
function parseHash() {
    const raw = location.hash.replace('#', '') || '/home';
    const [path, qs] = raw.split('?');
    const params = {};
    if (qs) qs.split('&').forEach(p => { const [k, v] = p.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
    return { path, params };
}
function navigate(hash) { location.hash = hash; }

function setActiveNav(pageKey) {
    document.querySelectorAll('.nav-center a').forEach(a => {
        a.classList.toggle('active', a.dataset.nav === pageKey);
    });
}

function render() {
    window.scrollTo({ top: 0 });
    const { path, params } = parseHash();
    const seg = path.split('/').filter(Boolean);
    const root = seg[0] || 'home';
    setActiveNav(root);

    if (root === 'home') return renderHome();
    if (root === 'browse') return renderBrowse(params);
    if (root === 'subjects') return renderSubjects();
    if (root === 'categories') return renderCategories();
    if (root === 'authors') return renderAuthors();
    if (root === 'resource') return renderResourceDetail(parseInt(seg[1], 10));
    if (root === 'favorites') return renderFavorites();
    if (root === 'mylibrary') return renderMyLibrary();
    if (root === 'about') return renderAbout();
    if (root === 'contact') return renderContact();
    if (root === 'dashboard') return renderDashboard();
    return render404();
}

/* ---------- HOME ---------- */
function renderHome() {
    const featured = RESOURCES.filter(r => r.featured).slice(0, 8);
    const popular = RESOURCES.filter(r => r.popular).slice(0, 10);
    const recent = [...RESOURCES].sort((a, b) => b.dateAdded - a.dateAdded).slice(0, 8);

    app.innerHTML = `
  <div class="page active">
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <h1>Your Knowledge. <span>Your Library.</span> Anywhere.</h1>
          <p>Discover books, notes, PDFs, and educational resources designed to make learning easier, faster, and more organized.</p>
          <div class="search-box">
            <input id="heroSearch" placeholder="Search books, notes, subjects, authors..." autocomplete="off">
            <button class="btn btn-primary" id="heroSearchBtn">Search</button>
            <div class="search-suggestions" id="heroSuggestions"></div>
          </div>
          <div class="cta-row">
            <button class="btn btn-primary" onclick="location.hash='#/browse'">Explore Library</button>
            <button class="btn btn-outline" onclick="location.hash='#/subjects'">Browse Subjects</button>
          </div>
        </div>
        <div class="hero-visual">📚</div>
      </div>
    </section>

    <section>
      <div class="container stats">
        <div class="stats-grid">
          <div class="stat"><h3 data-counter="10000">0+</h3><p>Resources</p></div>
          <div class="stat"><h3 data-counter="5000">0+</h3><p>Books</p></div>
          <div class="stat"><h3 data-counter="50">0+</h3><p>Subjects</p></div>
          <div class="stat"><h3 data-counter="1000">0+</h3><p>Authors</p></div>
          <div class="stat"><h3 data-counter="25000">0+</h3><p>Learners</p></div>
        </div>
      </div>
    </section>

    <section class="container">
      <div class="section-head"><div><h2>Browse by Subject</h2><p>Find resources organized by field of study</p></div><a class="view-all" href="#/subjects">View All →</a></div>
      <div class="grid-4 reveal" id="subjectGrid"></div>
    </section>

    <section class="container">
      <div class="section-head"><div><h2>Featured Resources</h2><p>Hand-picked materials to jump-start your learning</p></div></div>
      <div class="res-grid reveal" id="featuredGrid"></div>
    </section>

    <section class="container">
      <div class="section-head"><div><h2>Popular on LearnShelf</h2><p>Trending among learners this week</p></div></div>
      <div class="scroller-wrap">
        <button class="scroll-arrow left" onclick="scrollPopular(-1)">‹</button>
        <div class="scroller reveal" id="popularScroller"></div>
        <button class="scroll-arrow right" onclick="scrollPopular(1)">›</button>
      </div>
    </section>

    <section class="container">
      <div class="section-head"><div><h2>Recently Added</h2><p>The newest materials on the shelf</p></div><a class="view-all" href="#/browse?sort=recent">View All →</a></div>
      <div class="res-grid reveal" id="recentGrid"></div>
    </section>

    <section class="container">
      <div class="section-head"><div><h2>Why Choose LearnShelf</h2></div></div>
      <div class="grid-3">
        <div class="benefit-card"><div class="ic">🗂️</div><h4>Everything in One Place</h4><p>Access different educational resources without visiting multiple websites.</p></div>
        <div class="benefit-card"><div class="ic">🌐</div><h4>Learn Anywhere</h4><p>Access educational materials anytime from any browser-enabled device.</p></div>
        <div class="benefit-card"><div class="ic">⚡</div><h4>Fast Search</h4><p>Quickly find books, documents, notes, and learning materials.</p></div>
        <div class="benefit-card"><div class="ic">📊</div><h4>Organized Learning</h4><p>Browse resources by subjects, categories, and authors.</p></div>
        <div class="benefit-card"><div class="ic">📱</div><h4>Responsive Design</h4><p>Use LearnShelf smoothly on desktop, tablet, and mobile devices.</p></div>
        <div class="benefit-card"><div class="ic">🆓</div><h4>Free and Accessible</h4><p>Educational resources made easily accessible to every student.</p></div>
      </div>
    </section>
  </div>`;

    document.getElementById('subjectGrid').innerHTML = SUBJECTS.map(s => {
        const n = RESOURCES.filter(r => r.subject === s.name).length;
        return `<div class="subject-card" onclick="location.hash='#/browse?subject=${encodeURIComponent(s.name)}'"><div class="ic">${s.icon}</div><h4>${s.name}</h4><span>${n} resources</span></div>`;
    }).join('');

    document.getElementById('featuredGrid').innerHTML = featured.map(resourceCard).join('');
    document.getElementById('popularScroller').innerHTML = popular.map(resourceCard).join('');
    document.getElementById('recentGrid').innerHTML = recent.map(resourceCard).join('');
    [document.getElementById('featuredGrid'), document.getElementById('popularScroller'), document.getElementById('recentGrid')].forEach(bindCardEvents);

    observeReveals(app); animateCounters(app);
    setupHeroSearch();
}

window.scrollPopular = function (dir) {
    const el = document.getElementById('popularScroller');
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
};

/* ---------- BROWSE ---------- */
function renderBrowse(params) {
    browseState = { subject: params.subject || '', category: params.category || '', author: '', type: '', rating: '', sort: params.sort || 'popular', q: params.q || '', view: browseState.view || 'grid' };

    app.innerHTML = `
  <div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>Browse Library</h1><p>Explore ${RESOURCES.length} resources across ${SUBJECTS.length} subjects</p></div>
    <button class="btn btn-outline filter-drawer-toggle" id="filterDrawerToggle">☰ Filters</button>
    <div class="browse-layout">
      <aside class="filter-panel" id="filterPanel">
        <div class="filter-group"><h5>Subject</h5>
          <select id="fSubject"><option value="">All Subjects</option>${SUBJECTS.map(s => `<option value="${s.name}" ${browseState.subject === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><h5>Category</h5>
          <select id="fCategory"><option value="">All Categories</option>${CATEGORIES.map(c => `<option value="${c.name}" ${browseState.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><h5>Author</h5>
          <select id="fAuthor"><option value="">All Authors</option>${AUTHORS.map(a => `<option value="${a.name}">${a.name}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><h5>Resource Type</h5>
          <select id="fType"><option value="">All Types</option>${["Book", "Notes", "PDF", "Question Paper", "Study Guide"].map(t => `<option value="${t}">${t}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><h5>Minimum Rating</h5>
          <select id="fRating"><option value="">Any Rating</option><option value="4">4★ & up</option><option value="4.5">4.5★ & up</option></select>
        </div>
        <div class="filter-group"><h5>Language</h5>
          <select id="fLang"><option value="">Any Language</option><option value="English">English</option></select>
        </div>
        <button class="btn btn-primary" style="width:100%" id="clearFilters">Clear Filters</button>
      </aside>
      <div>
        <div class="toolbar">
          <div class="search-mini">🔍 <input id="browseSearch" placeholder="Search within results..." value="${browseState.q}"></div>
          <select id="sortSelect" style="padding:9px 12px;border-radius:10px;border:1px solid var(--border);background:var(--card);color:var(--text);">
            <option value="popular">Most Popular</option>
            <option value="recent">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
          <div class="view-toggle">
            <button id="gridViewBtn" class="active">▦</button>
            <button id="listViewBtn">☰</button>
          </div>
        </div>
        <div id="resultsCount" style="margin-bottom:14px; color:var(--text-muted); font-size:13.5px;"></div>
        <div id="resultsContainer" class="res-grid"></div>
      </div>
    </div>
  </div>`;

    document.getElementById('sortSelect').value = browseState.sort;

    const drawerToggle = document.getElementById('filterDrawerToggle');
    const panel = document.getElementById('filterPanel');
    drawerToggle.addEventListener('click', () => panel.classList.toggle('open'));

    ['fSubject', 'fCategory', 'fAuthor', 'fType', 'fRating', 'fLang'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });
    document.getElementById('sortSelect').addEventListener('change', applyFilters);
    document.getElementById('browseSearch').addEventListener('input', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', () => { navigate('#/browse'); });
    document.getElementById('gridViewBtn').addEventListener('click', () => { browseState.view = 'grid'; applyFilters(); });
    document.getElementById('listViewBtn').addEventListener('click', () => { browseState.view = 'list'; applyFilters(); });

    document.getElementById('fSubject').value = browseState.subject;
    document.getElementById('fCategory').value = browseState.category;

    applyFilters();
}

/* ---------- SUBJECTS / CATEGORIES / AUTHORS ---------- */
function renderSubjects() {
    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>All Subjects</h1><p>Choose a subject to explore related resources</p></div>
    <div class="grid-4">${SUBJECTS.map(s => {
        const n = RESOURCES.filter(r => r.subject === s.name).length;
        return `<div class="subject-card" onclick="location.hash='#/browse?subject=${encodeURIComponent(s.name)}'"><div class="ic">${s.icon}</div><h4>${s.name}</h4><span>${n} resources available</span></div>`;
    }).join('')}</div>
  </div>`;
}
function renderCategories() {
    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>Resource Categories</h1><p>Browse by resource type</p></div>
    <div class="grid-4">${CATEGORIES.map(c => {
        const n = RESOURCES.filter(r => r.category === c.name).length;
        return `<div class="category-card" onclick="location.hash='#/browse?category=${encodeURIComponent(c.name)}'"><div class="ic">${c.icon}</div><h4>${c.name}</h4><p>${c.desc}</p><span>${n} resources</span></div>`;
    }).join('')}</div>
  </div>`;
}
function renderAuthors() {
    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>Authors</h1><p>Discover educators and writers on LearnShelf</p></div>
    <div class="toolbar"><div class="search-mini">🔍 <input id="authorSearch" placeholder="Search authors..."></div></div>
    <div class="grid-4" id="authorGrid"></div>
  </div>`;
    function draw(q = '') {
        const filtered = AUTHORS.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));
        document.getElementById('authorGrid').innerHTML = filtered.map(a => {
            const n = RESOURCES.filter(r => r.author === a.name).length;
            return `<div class="subject-card" onclick="location.hash='#/browse?author=${encodeURIComponent(a.name)}'">
        <div class="ic">👤</div><h4>${a.name}</h4><span>${a.field} • ${n} resources</span></div>`;
        }).join('') || `<div class="empty-state"><div class="ic">🔍</div><p>No authors found.</p></div>`;
    }
    draw();
    document.getElementById('authorSearch').addEventListener('input', (e) => draw(e.target.value));
}

/* ---------- RESOURCE DETAIL ---------- */
function renderResourceDetail(id) {
    const r = RESOURCES.find(x => x.id === id);
    if (!r) return render404();
    trackRecentView(id);
    const related = RESOURCES.filter(x => x.subject === r.subject && x.id !== r.id).slice(0, 4);
    const sameAuthor = RESOURCES.filter(x => x.author === r.author && x.id !== r.id).slice(0, 4);
    const isFav = favorites.includes(r.id);

    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="detail-grid">
      <div><div class="detail-cover">${r.icon}</div></div>
      <div class="detail-info">
        <h1>${r.title}</h1>
        <div class="author">by <b>${r.author}</b> • ${r.subject}</div>
        <div class="res-tags"><span class="tag">${r.category}</span><span class="tag">${r.type}</span><span class="tag">${r.language}</span></div>
        <div class="info-grid">
          <div><span>Pages</span><b>${r.pages}</b></div>
          <div><span>Year</span><b>${r.year}</b></div>
          <div><span>Rating</span><b>⭐ ${r.rating}</b></div>
          <div><span>Views</span><b>${r.views.toLocaleString()}</b></div>
          <div><span>Downloads</span><b>${r.downloads.toLocaleString()}</b></div>
          <div><span>File Size</span><b>${(2 + (r.id % 8))}.${r.id % 9} MB</b></div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-primary" onclick="openReader(${r.id})">📖 Read Online</button>
          <button class="btn btn-accent" id="downloadBtn">⬇ Download</button>
          <button class="btn btn-outline" id="favDetailBtn">${isFav ? '❤ Favorited' : '🤍 Add to Favorites'}</button>
          <button class="btn btn-outline" id="libDetailBtn">➕ Add to My Library</button>
          <button class="btn btn-outline" id="shareBtn">🔗 Share</button>
        </div>
        <div class="tabs">
          <button class="tab-btn active" data-tab="desc">Description</button>
          <button class="tab-btn" data-tab="details">Details</button>
          <button class="tab-btn" data-tab="reviews">Reviews</button>
        </div>
        <div class="tab-panel active" id="tab-desc"><p>${r.description}</p></div>
        <div class="tab-panel" id="tab-details">
          <p>Language: ${r.language}<br>Publication Year: ${r.year}<br>Subject: ${r.subject}<br>Category: ${r.category}<br>Type: ${r.type}<br>Pages: ${r.pages}</p>
        </div>
        <div class="tab-panel" id="tab-reviews">
          <p>⭐⭐⭐⭐⭐ "Extremely well organized and easy to follow." — Learner<br><br>⭐⭐⭐⭐ "Great resource, would recommend for beginners." — Learner</p>
        </div>
      </div>
    </div>

    <section>
      <div class="section-head"><h2>More from ${r.subject}</h2></div>
      <div class="res-grid" id="relatedGrid">${related.map(resourceCard).join('')}</div>
    </section>
    <section>
      <div class="section-head"><h2>More from ${r.author}</h2></div>
      <div class="res-grid" id="authorGridDetail">${sameAuthor.map(resourceCard).join('') || '<p style="color:var(--text-muted)">No other resources from this author yet.</p>'}</div>
    </section>
  </div>`;

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => trackDownload(r.id));
    document.getElementById('favDetailBtn').addEventListener('click', () => { toggleFavorite(r.id); renderResourceDetail(r.id); });
    document.getElementById('libDetailBtn').addEventListener('click', () => addToLibrary(r.id));
    document.getElementById('shareBtn').addEventListener('click', () => {
        navigator.clipboard?.writeText(location.href).catch(() => { });
        toast('Link copied to clipboard');
    });
    bindCardEvents(document.getElementById('relatedGrid'));
    bindCardEvents(document.getElementById('authorGridDetail'));
}

/* ---------- FAVORITES / MY LIBRARY ---------- */
function renderFavorites() {
    const items = RESOURCES.filter(r => favorites.includes(r.id));
    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>My Favorites</h1><p>Resources you've bookmarked for later</p></div>
    <div class="res-grid" id="favGrid">${items.length ? items.map(resourceCard).join('') :
            `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">💔</div><h3>Your favorites shelf is empty</h3><p>Start exploring resources you love.</p></div>`}</div>
  </div>`;
    bindCardEvents(document.getElementById('favGrid'));
}
function renderMyLibrary() {
    const saved = RESOURCES.filter(r => myLibrary.includes(r.id));
    const recent = recentlyViewed.map(id => RESOURCES.find(r => r.id === id)).filter(Boolean);
    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="page-hero"><h1>My Library</h1><p>Your saved resources and reading activity</p></div>
    <div class="section-head"><h2>Saved Resources</h2></div>
    <div class="res-grid" id="savedGrid" style="margin-bottom:40px;">${saved.length ? saved.map(resourceCard).join('') :
            `<div class="empty-state" style="grid-column:1/-1;"><div class="ic">📚</div><h3>Your personal library is waiting for its first book</h3></div>`}</div>
    <div class="section-head"><h2>Recently Viewed</h2></div>
    <div class="res-grid" id="recentViewGrid">${recent.length ? recent.map(resourceCard).join('') : `<p style="color:var(--text-muted)">No recently viewed resources yet.</p>`}</div>
  </div>`;
    bindCardEvents(document.getElementById('savedGrid'));
    bindCardEvents(document.getElementById('recentViewGrid'));
}

/* ---------- ABOUT / CONTACT ---------- */
function renderAbout() {
    app.innerHTML = `<div class="page active container" style="padding-top:30px; max-width:900px;">
    <div class="page-hero"><h1>About LearnShelf</h1><p>Digital learning, organized and accessible.</p></div>
    <div class="about-block"><p>LearnShelf is a digital e-library designed to provide easy access to educational resources and study materials online, bringing books, notes, PDFs, and reference materials together in one organized platform.</p></div>
    <div class="about-block"><h3>Our Mission</h3><p style="margin-top:8px;color:var(--text-muted)">To promote digital learning and make educational resources easily accessible for everyone.</p></div>
    <div class="about-block"><h3>Our Vision</h3><p style="margin-top:8px;color:var(--text-muted)">A world where quality educational materials are never more than a search away, regardless of geography or background.</p></div>
    <div class="about-block"><h3>Why LearnShelf?</h3><p style="margin-top:8px;color:var(--text-muted)">Students often waste time hopping between sites to find notes, papers, and books. LearnShelf centralizes discovery, reading, and downloading in one clean interface.</p></div>
    <div class="about-block"><h3>How LearnShelf Helps Students</h3><p style="margin-top:8px;color:var(--text-muted)">Powerful filters, subject and author browsing, an online reader, and a personal library help learners stay organized and focused.</p></div>
    <div class="about-block"><h3>Technologies Used</h3><div class="res-tags" style="margin-top:8px;"><span class="tag">HTML5</span><span class="tag">CSS3</span><span class="tag">Vanilla JavaScript</span></div></div>
  </div>`;
}
function renderContact() {
    app.innerHTML = `<div class="page active container" style="padding-top:30px; max-width:800px;">
    <div class="page-hero"><h1>Contact Us</h1><p>We'd love to hear from you</p></div>
    <div class="about-block">
      <div class="form-group"><label>Name</label><input id="cName"><div class="form-error" id="cNameErr">Please enter your name.</div></div>
      <div class="form-group"><label>Email</label><input id="cEmail"><div class="form-error" id="cEmailErr">Please enter a valid email.</div></div>
      <div class="form-group"><label>Subject</label><input id="cSubject"><div class="form-error" id="cSubjectErr">Please enter a subject.</div></div>
      <div class="form-group"><label>Message</label><textarea id="cMessage" rows="5"></textarea><div class="form-error" id="cMessageErr">Message cannot be empty.</div></div>
      <button class="btn btn-primary" id="contactSubmit">Send Message</button>
    </div>
    <div class="about-block">
      <h3 style="margin-bottom:14px;">Frequently Asked Questions</h3>
      <div class="faq-item"><div class="faq-q">Is LearnShelf free to use? <span>+</span></div><div class="faq-a">Yes, all resources on LearnShelf are free and accessible to every learner.</div></div>
      <div class="faq-item"><div class="faq-q">Can I download resources for offline use? <span>+</span></div><div class="faq-a">Yes, most resources include a download option on their details page.</div></div>
      <div class="faq-item"><div class="faq-q">Do I need an account to read resources? <span>+</span></div><div class="faq-a">You can browse and read freely; an account lets you save favorites and build your library.</div></div>
    </div>
  </div>`;

    document.querySelectorAll('.faq-item').forEach(item => {
        item.querySelector('.faq-q').addEventListener('click', () => item.classList.toggle('open'));
    });

    document.getElementById('contactSubmit').addEventListener('click', () => {
        const name = document.getElementById('cName').value.trim();
        const email = document.getElementById('cEmail').value.trim();
        const subject = document.getElementById('cSubject').value.trim();
        const message = document.getElementById('cMessage').value.trim();
        let ok = true;
        document.getElementById('cNameErr').classList.toggle('show', !name); if (!name) ok = false;
        document.getElementById('cEmailErr').classList.toggle('show', !isValidEmail(email)); if (!isValidEmail(email)) ok = false;
        document.getElementById('cSubjectErr').classList.toggle('show', !subject); if (!subject) ok = false;
        document.getElementById('cMessageErr').classList.toggle('show', !message); if (!message) ok = false;
        if (!ok) return;
        toast('Message sent! We will get back to you soon.');
        ['cName', 'cEmail', 'cSubject', 'cMessage'].forEach(id => document.getElementById(id).value = '');
    });
}

/* ---------- DASHBOARD ---------- */
function renderDashboard() {
    if (!currentUser) { openAuth('login'); navigate('#/home'); return; }
    const savedCount = myLibrary.length, favCount = favorites.length, dlCount = downloadHistory.length;
    const recent = recentlyViewed.map(id => RESOURCES.find(r => r.id === id)).filter(Boolean).slice(0, 4);

    app.innerHTML = `<div class="page active container" style="padding-top:30px;">
    <div class="profile-banner">
      <div class="avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
      <div><h2 style="color:#fff;">Welcome back, ${currentUser.name}!</h2><p style="opacity:.9;font-size:14px;">${currentUser.email}</p></div>
    </div>
    <div class="dash-stats">
      <div class="dash-card"><h3>${Math.min(savedCount, 12)}</h3><span>Books Read</span></div>
      <div class="dash-card"><h3>${savedCount}</h3><span>Resources Saved</span></div>
      <div class="dash-card"><h3>${dlCount}</h3><span>Downloads</span></div>
      <div class="dash-card"><h3>${favCount}</h3><span>Favorites</span></div>
    </div>
    <div class="section-head"><h2>Recently Viewed</h2></div>
    <div class="res-grid" id="dashRecent">${recent.length ? recent.map(resourceCard).join('') : '<p style="color:var(--text-muted)">Nothing viewed yet — go explore the library!</p>'}</div>
  </div>`;
    bindCardEvents(document.getElementById('dashRecent'));
}

/* ---------- 404 ---------- */
function render404() {
    app.innerHTML = `<div class="page active container not-found">
    <div class="ic">📭</div>
    <h1>Oops! This shelf seems to be empty.</h1>
    <p style="color:var(--text-muted); margin:14px 0 24px;">The page you're looking for doesn't exist.</p>
    <button class="btn btn-primary" onclick="location.hash='#/home'">Return to Home</button>
  </div>`;
}

/* ---------- ONLINE READER ---------- */
let readerState = { id: null, page: 1, totalPages: 8, zoom: 100 };
window.openReader = function (id) {
    const r = RESOURCES.find(x => x.id === id);
    if (!r) return;
    readerState = { id, page: 1, totalPages: Math.max(4, Math.min(12, Math.round(r.pages / 40))), zoom: 100 };
    document.getElementById('readerTitle').textContent = r.title;
    document.getElementById('readerModal').classList.add('show');
    renderReaderPage();
};
function sampleContent(r, page) {
    return `<h3 style="margin-bottom:14px;">${r.title} — Page ${page}</h3>
  <p>This is simulated reading content for demonstration purposes. In a full deployment, this pane would render the actual document or PDF page for "<b>${r.title}</b>" by ${r.author}, covering key ideas in ${r.subject}.</p>
  <p style="margin-top:14px;">Chapter content continues here, offering structured explanations, examples, and exercises designed to reinforce understanding of the subject matter presented on this page.</p>`;
}
function renderReaderPage() {
    const r = RESOURCES.find(x => x.id === readerState.id);
    document.getElementById('readerPage').innerHTML = sampleContent(r, readerState.page);
    document.getElementById('readerPage').style.transform = `scale(${readerState.zoom / 100})`;
    document.getElementById('readerPageIndicator').textContent = `Page ${readerState.page} / ${readerState.totalPages}`;
}
function initReader() {
    document.getElementById('readerClose').addEventListener('click', () => document.getElementById('readerModal').classList.remove('show'));
    document.getElementById('readerPrev').addEventListener('click', () => { if (readerState.page > 1) { readerState.page--; renderReaderPage(); } });
    document.getElementById('readerNext').addEventListener('click', () => { if (readerState.page < readerState.totalPages) { readerState.page++; renderReaderPage(); } });
    document.getElementById('readerZoomIn').addEventListener('click', () => { readerState.zoom = Math.min(160, readerState.zoom + 10); renderReaderPage(); });
    document.getElementById('readerZoomOut').addEventListener('click', () => { readerState.zoom = Math.max(60, readerState.zoom - 10); renderReaderPage(); });
    document.getElementById('readerFullscreen').addEventListener('click', () => {
        const el = document.getElementById('readerModal');
        if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.();
    });
    document.getElementById('readerBookmark').addEventListener('click', () => { toggleFavorite(readerState.id); toast('Bookmarked current resource'); });
    document.getElementById('readerDownload').addEventListener('click', () => trackDownload(readerState.id));
}

/* ---------- ENTRY POINT ---------- */
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initAvatarDropdown();
    initBackToTop();
    initAuth();
    initReader();
    updateFavBadge();
    document.getElementById('searchIconBtn').addEventListener('click', () => navigate('#/browse'));
    render();
    setTimeout(() => { document.getElementById('loader').classList.add('fade-out'); }, 900);
});