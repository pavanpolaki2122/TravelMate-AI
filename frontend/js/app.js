/**
 * TravelMate AI – Master Application Controller v2.0
 * Manages 15 screens, navigation, home dashboard, and global utilities.
 */

const App = {
  currentScreen: 'splashScreen',
  placesCache: [],

  // Module icon grid config
  MODULES: [
    { icon: '🧭', label: 'AI Planner',   screen: 'plannerScreen' },
    { icon: '🗺️', label: 'Explore Map',  screen: 'mapScreen'     },
    { icon: '📱', label: 'AR Nav',        screen: 'arScreen'      },
    { icon: '🎧', label: 'Tour Guide',   screen: 'guideScreen'   },
    { icon: '💎', label: 'Hidden Gems',  screen: 'hiddenScreen'  },
    { icon: '📍', label: 'Nearby',       screen: 'nearbyScreen'  },
    { icon: '💰', label: 'Budget',       screen: 'budgetScreen'  },
    { icon: '💬', label: 'AI Chat',      screen: 'assistantScreen'},
    { icon: '📶', label: 'Offline',      screen: 'offlineScreen' },
    { icon: '🚨', label: 'Safety SOS',   screen: 'safetyScreen'  },
    { icon: '👥', label: 'Community',    screen: 'communityScreen'},
  ],

  init() {
    console.log('[TravelMate AI] Initializing v2.0...');
    this.setupClock();
    this.setupNavigation();
    this.renderModuleGrid();

    // Init all modules
    AuthModule.init();
    OfflineManager.init();
    MapModule.init('mapViewport');
    TourGuideModule.init();
    LiveAssistant.init();
    SafetySystem.init();
    CommunityModule.init();
    BudgetCalculator.init();
    NearbyExplorer.init();
    HiddenGemsModule.init();
    SafetySystem.loadNearbyServices();

    // Load home content
    this.loadHomeContent();

    // Auto-transition from splash
    setTimeout(() => {
      if (this.currentScreen === 'splashScreen') {
        const user = localStorage.getItem('tm_user');
        this.nav(user ? 'homeScreen' : 'homeScreen'); // go home by default for demo
      }
    }, 2400);

    console.log('[TravelMate AI] ✅ Ready — 15 screens active, all 11 modules online');
  },

  setupClock() {},

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const s = btn.getAttribute('data-s');
        if (s) this.nav(s);
      });
    });
  },

  nav(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (!target) { console.warn('[App] Screen not found:', screenId); return; }
    target.classList.add('active');
    this.currentScreen = screenId;

    // Update bottom nav active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-s') === screenId);
    });

    // Screen-specific actions
    if (screenId === 'mapScreen') {
      setTimeout(() => {
        if (MapModule.isGoogleMap && MapModule.map && window.google) {
          google.maps.event.trigger(MapModule.map, 'resize');
          if (MapModule.userLoc) MapModule.map.setCenter(MapModule.userLoc);
        } else if (MapModule.map && typeof MapModule.map.invalidateSize === 'function') {
          MapModule.map.invalidateSize();
        }
      }, 150);
    } else if (screenId === 'arScreen') {
      ARNavigation.start();
    } else {
      ARNavigation.stop();
    }

    if (screenId === 'budgetScreen') BudgetCalculator.reload();
    if (screenId === 'nearbyScreen') NearbyExplorer.load();
    if (screenId === 'safetyScreen') SafetySystem.loadNearbyServices();
    if (screenId === 'communityScreen') CommunityModule.load();
    if (screenId === 'hiddenScreen') HiddenGemsModule.load();

    target.scrollTop = 0;
  },

  renderModuleGrid() {
    const grid = document.getElementById('moduleGrid');
    if (!grid) return;
    grid.innerHTML = this.MODULES.map(m => `
      <div onclick="App.nav('${m.screen}')" class="module-tile-3d">
        <div class="mod-icon">${m.icon}</div>
        <div class="mod-lbl">${m.label}</div>
      </div>
    `).join('');
  },

  async loadHomeContent() {
    try {
      const [placesData, hiddenData] = await Promise.all([
        ApiClient.getAllPlaces(),
        ApiClient.getHiddenPlaces()
      ]);

      this.placesCache = placesData.places || [];
      this.renderFeaturedAttractions(this.placesCache.filter(p => p.category === 'attraction'));
      this.renderHiddenGemsHome(hiddenData.hidden_places || []);
      this.loadCommunityPreview();

      // Greet
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      const name = user.name ? user.name.split(' ')[0] : 'Explorer';
      const hrs = new Date().getHours();
      const greet = hrs < 12 ? 'Good Morning' : hrs < 17 ? 'Good Afternoon' : 'Good Evening';
      const el = document.getElementById('greetMsg');
      if (el) el.textContent = `${greet}, ${name}! Ready to explore? 🙏`;

    } catch(e) {
      console.warn('[App] Home load error:', e);
    }
  },

  renderFeaturedAttractions(places) {
    const c = document.getElementById('featuredHScroll');
    if (!c) return;
    const items = places.slice(0, 6);
    c.innerHTML = items.length ? items.map(p => `
      <div class="place-card-h" onclick="App.openGuide('${p.id}')">
        <img src="${p.image_url || 'https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=400&q=70'}" 
             alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70'">
        <div class="place-card-h-body">
          <div style="font-size:12.5px;font-weight:800;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;">${p.name}</div>
          <div style="font-size:10px;color:#94A3B8;margin-bottom:6px;">${p.timings || 'See details'}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;font-weight:800;color:#F59E0B;">⭐ ${p.rating}</span>
            <span class="badge ${p.entry_fee_inr === 0 ? 'badge-green badge-free' : 'badge-blue'}" style="font-size:9px;">
              ${p.entry_fee_inr === 0 ? 'Free' : '₹' + p.entry_fee_inr}
            </span>
          </div>
          <div style="display:flex;gap:4px;margin-top:6px;">
            <button onclick="event.stopPropagation();App.openDirections('${p.id}')" class="btn btn-xs btn-primary" style="font-size:10px;padding:3px 6px;flex:1;">🧭 Route</button>
            <button onclick="event.stopPropagation();App.openGuide('${p.id}')" class="btn btn-xs btn-secondary" style="font-size:10px;padding:3px 6px;flex:1;">🎧 Guide</button>
          </div>
        </div>
      </div>
    `).join('') : '<div style="color:#94A3B8;font-size:12px;padding:10px;">Loading attractions...</div>';
  },

  renderHiddenGemsHome(gems) {
    const c = document.getElementById('hiddenGemsList');
    if (!c) return;
    const items = gems.slice(0, 3);
    c.innerHTML = items.length ? items.map(p => `
      <div class="place-card-v" onclick="App.launchAR('${p.id}','${p.name}',${p.lat || 17.3616},${p.lng || 78.4747})">
        <img src="${p.image_url || 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=200&q=70'}" 
             alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=200&q=70'">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <span style="font-size:13px;font-weight:800;color:#0F172A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</span>
            <span class="badge badge-hidden" style="flex-shrink:0;font-size:9px;">Hidden</span>
          </div>
          <p style="font-size:11px;color:#64748B;line-height:1.3;margin-bottom:6px;">${(p.short_desc || '').slice(0,70)}${p.short_desc && p.short_desc.length > 70 ? '...' : ''}</p>
          <div style="display:flex;gap:8px;">
            <span style="font-size:10px;font-weight:800;color:#0072CE;">📱 AR Ready</span>
            <span style="font-size:10px;font-weight:800;color:#10B981;">⭐ ${p.rating}</span>
          </div>
        </div>
      </div>
    `).join('') : '<div class="place-card-v" style="cursor:default;"><div style="font-size:12px;color:#94A3B8;">No hidden gems loaded yet. Submit one!</div></div>';
  },

  async loadCommunityPreview() {
    try {
      const data = await ApiClient.getPosts();
      const c = document.getElementById('communityPreview');
      if (!c) return;
      const posts = (data.posts || []).slice(0, 2);
      c.innerHTML = posts.length ? posts.map(p => `
        <div class="card card-sm" style="cursor:pointer;" onclick="App.nav('communityScreen')">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#0072CE,#00E5FF);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#0A1128;flex-shrink:0;">${(p.user_name || 'U')[0].toUpperCase()}</div>
            <div>
              <div style="font-size:12px;font-weight:800;color:#0F172A;">${p.user_name || 'Explorer'}</div>
              <div style="font-size:10px;color:#94A3B8;">📍 ${p.location || 'Hyderabad'}</div>
            </div>
            <span class="badge badge-blue" style="margin-left:auto;font-size:9px;">❤️ ${p.likes || 0}</span>
          </div>
          <p style="font-size:12px;color:#475569;line-height:1.4;">${(p.content || '').slice(0, 100)}${(p.content || '').length > 100 ? '...' : ''}</p>
        </div>
      `).join('') : `<div class="card card-sm" style="cursor:pointer;" onclick="App.nav('communityScreen')">
        <div style="font-size:12px;color:#64748B;">Be the first to share your Hyderabad experience! 🌟</div>
      </div>`;
    } catch(e) {}
  },

  launchAR(id, name, lat, lng) {
    ARNavigation.setTarget(id, name, lat, lng);
    this.nav('arScreen');
    this.toast(`AR Navigation locked onto ${name}!`);
  },

  openGuide(placeId) {
    TourGuideModule.load(placeId);
    this.nav('guideScreen');
  },

  openDirections(placeId) {
    this.nav('mapScreen');
    setTimeout(() => {
      MapModule.routeTo(placeId);
    }, 250);
  },

  toast(msg, type = 'default') {
    const existing = document.getElementById('appToast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.id = 'appToast';
    t.className = 'toast';
    t.textContent = msg;
    if (type === 'success') t.style.borderColor = 'rgba(16,185,129,0.4)';
    if (type === 'error') t.style.borderColor = 'rgba(239,68,68,0.4)';
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 2800);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
