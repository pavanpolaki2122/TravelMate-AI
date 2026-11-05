/**
 * TravelMate AI – Authentication & User Management Module v3.0
 * Handles real email/password login, registration, and logout with SQLite persistence.
 */

const AuthModule = {
  user: null,

  init() {
    const stored = localStorage.getItem('tm_user');
    if (stored) {
      try {
        this.user = JSON.parse(stored);
        this.updateUI();
      } catch (e) {
        localStorage.removeItem('tm_user');
      }
    } else {
      // Default guest state
      this.updateUI();
    }
  },

  isLoggedIn() {
    return !!(this.user && this.user.id);
  },

  async login(email, password) {
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();

    if (!email || !password) {
      App.toast('Please enter both email and password.', 'error');
      return;
    }

    App.toast('Signing in...', 'info');

    try {
      const res = await ApiClient.login(email, password);
      const user = res.user || res;
      this._setUser(user);
      App.toast(`Welcome back, ${this.user.name}! 🌟`, 'success');
      App.nav('homeScreen');
      App.loadHomeContent();
    } catch (err) {
      console.warn('[Auth] Login failed:', err);
      App.toast('Invalid email or password. Please try again.', 'error');
    }
  },

  async register(name, email, password) {
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    password = (password || '').trim();

    if (!name || !email || !password) {
      App.toast('Please fill out all registration fields.', 'error');
      return;
    }
    if (password.length < 4) {
      App.toast('Password must be at least 4 characters.', 'error');
      return;
    }

    App.toast('Creating your travel account...', 'info');

    try {
      const res = await ApiClient.register(name, email, password);
      const user = res.user || res;
      this._setUser(user);
      App.toast(`Account created! Welcome, ${this.user.name} 🎉`, 'success');
      App.nav('homeScreen');
      App.loadHomeContent();
    } catch (err) {
      console.warn('[Auth] Registration error:', err);
      const msg = err.message && err.message.includes('exists')
        ? 'Account already exists. Please sign in.'
        : 'Could not create account. Please try again.';
      App.toast(msg, 'error');
    }
  },

  demoLogin() {
    this._setUser({
      id: 'demo_user_777',
      name: 'Jayasree Explorer',
      email: 'tourist@travelmate.ai',
      preferred_language: 'en',
      travel_style: 'Budget Explorer'
    });
    App.toast('Logged in as Jayasree Explorer (Demo) ⚡', 'success');
    App.nav('homeScreen');
    App.loadHomeContent();
  },

  saveProfile() {
    const name = document.getElementById('settName')?.value?.trim();
    const lang = document.getElementById('settLang')?.value;
    const style = document.getElementById('settStyle')?.value;

    if (this.user) {
      this.user.name = name || this.user.name;
      this.user.preferred_language = lang || this.user.preferred_language;
      this.user.travel_style = style || this.user.travel_style;
      localStorage.setItem('tm_user', JSON.stringify(this.user));
      this.updateUI();
      App.toast('Profile preferences saved! ✅', 'success');
    }
  },

  logout() {
    localStorage.removeItem('tm_user');
    this.user = null;
    this.updateUI();
    App.nav('authScreen');
    App.toast('Signed out successfully. See you next trip! 👋', 'info');
  },

  _setUser(data) {
    const u = data.user || data;
    this.user = {
      id: u.id || u.user_id || `usr_${Date.now()}`,
      name: u.full_name || u.name || u.email?.split('@')[0] || 'Traveler',
      email: u.email || '',
      preferred_language: u.preferred_language || 'en',
      travel_style: u.travel_style || 'Budget'
    };
    localStorage.setItem('tm_user', JSON.stringify(this.user));
    this.updateUI();
  },

  updateUI() {
    const isLogged = this.isLoggedIn();
    const name = isLogged ? this.user.name : 'Guest Tourist';
    const email = isLogged ? this.user.email : 'Sign in to sync your travel data';
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    // Profile Screen Elements
    const pName = document.getElementById('pName');
    if (pName) pName.textContent = name;

    const pEmail = document.getElementById('pEmail');
    if (pEmail) pEmail.textContent = email;

    const av = document.getElementById('avatarEl');
    if (av) av.textContent = initials || '👤';

    const pBadge = document.getElementById('pBadge');
    if (pBadge) {
      pBadge.textContent = isLogged ? '✅ Verified Explorer' : '👀 Guest Mode (Tap to Sign In)';
      pBadge.className = isLogged ? 'badge badge-green' : 'badge badge-amber';
    }

    const btnSavePref = document.getElementById('btnSavePref');
    if (btnSavePref) btnSavePref.style.display = isLogged ? 'block' : 'none';

    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.style.display = isLogged ? 'block' : 'none';

    const btnSwitchAuth = document.getElementById('btnSwitchAuth');
    if (btnSwitchAuth) {
      if (isLogged) {
        btnSwitchAuth.textContent = '🔄 Switch / Register Account';
        btnSwitchAuth.className = 'btn btn-secondary';
      } else {
        btnSwitchAuth.textContent = '🔑 Sign In / Create Account';
        btnSwitchAuth.className = 'btn btn-primary';
      }
    }

    // Header profile button status
    const headerProfileBtn = document.querySelector('.header-actions .hbtn[title="Profile"]');
    if (headerProfileBtn) {
      headerProfileBtn.textContent = isLogged ? '👤' : '🔑';
    }

    // Settings form fields
    const sn = document.getElementById('settName');
    if (sn) sn.value = isLogged ? this.user.name : '';

    const sl = document.getElementById('settLang');
    if (sl && this.user) sl.value = this.user.preferred_language || 'en';

    const ss = document.getElementById('settStyle');
    if (ss && this.user) ss.value = this.user.travel_style || 'Budget';

    // Home greeting
    const greet = document.getElementById('greetMsg');
    if (greet) {
      const hrs = new Date().getHours();
      const timeGreeting = hrs < 12 ? 'Good Morning' : hrs < 17 ? 'Good Afternoon' : 'Good Evening';
      const firstName = name.split(' ')[0];
      greet.textContent = `${timeGreeting}, ${firstName}! Ready to explore? 🙏`;
    }
  }
};
