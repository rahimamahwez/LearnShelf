/* =====================================================================
   AUTHENTICATION (simulated, localStorage-backed)
===================================================================== */
const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

let users = store.get('ls_users', []);
let currentUser = store.get('ls_currentUser', null);

function persistAuth() {
    store.set('ls_users', users);
    store.set('ls_currentUser', currentUser);
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function updateAuthUI() {
    const loggedOut = document.getElementById('loggedOutBox');
    const loggedIn = document.getElementById('loggedInBox');
    if (currentUser) {
        loggedOut.classList.add('hidden'); loggedIn.classList.remove('hidden');
        document.getElementById('avatarInitial').textContent = currentUser.name.charAt(0).toUpperCase();
    } else {
        loggedOut.classList.remove('hidden'); loggedIn.classList.add('hidden');
    }
}

const authModal = document.getElementById('authModal');
function openAuth(mode = 'login') {
    authModal.classList.add('show');
    document.getElementById('loginForm').classList.toggle('hidden', mode !== 'login');
    document.getElementById('signupForm').classList.toggle('hidden', mode !== 'signup');
}
function closeAuth() { authModal.classList.remove('show'); }

function initAuth() {
    updateAuthUI();

    document.getElementById('authClose').addEventListener('click', closeAuth);
    authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuth(); });
    document.getElementById('loginBtnNav').addEventListener('click', () => openAuth('login'));
    document.getElementById('signupBtnNav').addEventListener('click', () => openAuth('signup'));
    document.getElementById('mobileLoginBtn').addEventListener('click', () => { closeMobile(); openAuth('login'); });
    document.getElementById('mobileSignupBtn').addEventListener('click', () => { closeMobile(); openAuth('signup'); });
    document.getElementById('goSignup').addEventListener('click', () => openAuth('signup'));
    document.getElementById('goLogin').addEventListener('click', () => openAuth('login'));

    document.querySelectorAll('[data-toggle]').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = document.getElementById(btn.getAttribute('data-toggle'));
            if (input.type === 'password') { input.type = 'text'; btn.textContent = 'Hide'; } else { input.type = 'password'; btn.textContent = 'Show'; }
        });
    });

    document.getElementById('loginSubmit').addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;
        let ok = true;
        document.getElementById('loginEmailErr').classList.toggle('show', !isValidEmail(email)); if (!isValidEmail(email)) ok = false;
        document.getElementById('loginPassErr').classList.toggle('show', pass.length < 6); if (pass.length < 6) ok = false;
        if (!ok) return;
        const user = users.find(u => u.email === email && u.password === pass);
        if (!user) { toast('Invalid email or password', 'error'); return; }
        currentUser = { name: user.name, email: user.email };
        persistAuth(); updateAuthUI(); closeAuth(); toast('Welcome back, ' + user.name + '!');
    });

    document.getElementById('signupSubmit').addEventListener('click', () => {
        const name = document.getElementById('suName').value.trim();
        const email = document.getElementById('suEmail').value.trim();
        const pass = document.getElementById('suPassword').value;
        const confirm = document.getElementById('suConfirm').value;
        let ok = true;
        document.getElementById('suNameErr').classList.toggle('show', name.length < 2); if (name.length < 2) ok = false;
        document.getElementById('suEmailErr').classList.toggle('show', !isValidEmail(email)); if (!isValidEmail(email)) ok = false;
        document.getElementById('suPassErr').classList.toggle('show', pass.length < 6); if (pass.length < 6) ok = false;
        document.getElementById('suConfirmErr').classList.toggle('show', pass !== confirm); if (pass !== confirm) ok = false;
        if (!ok) return;
        if (users.find(u => u.email === email)) { toast('An account with this email already exists', 'error'); return; }
        users.push({ name, email, password: pass });
        currentUser = { name, email };
        persistAuth(); updateAuthUI(); closeAuth(); toast('Account created! Welcome, ' + name + '.');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        currentUser = null; persistAuth(); updateAuthUI(); toast('Logged out successfully'); navigate('#/home');
    });
}