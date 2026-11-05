/**
 * TravelMate AI – All-in-One Nearby Explorer Module v2.0
 * Live GPS distance-sorted facilities and attractions with category filter and radius slider.
 */

const NearbyExplorer = {
  currentCategory: 'all',
  radiusKm: 20,
  userLat: 17.3850,
  userLng: 78.4867,

  init() {
    this.updateUserLocation();
    this.load();
  },

  updateUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.load();
        },
        () => {
          // Central Hyderabad fallback
          this.userLat = 17.3850;
          this.userLng = 78.4867;
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  },

  setRadius(km) {
    this.radiusKm = parseFloat(km) || 20;
    const label = document.getElementById('radiusLabel');
    if (label) label.textContent = `${this.radiusKm} km`;
    this.load();
  },

  setCategory(cat, btnEl) {
    this.currentCategory = cat;
    document.querySelectorAll('#nearbyScreen .chip').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.load();
  },

  async load() {
    const container = document.getElementById('nearbyResults');
    if (!container) return;

    container.innerHTML = `
      <div class="card" style="text-align:center;padding:24px;">
        <div style="font-size:28px;margin-bottom:8px;">📡</div>
        <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Scanning nearby places...</div>
        <div style="font-size:12px;color:var(--text-muted);">Radius: ${this.radiusKm} km · Category: ${this.currentCategory}</div>
      </div>
    `;

    try {
      const res = await ApiClient.getNearby(
        this.userLat,
        this.userLng,
        this.radiusKm,
        this.currentCategory
      );

      const items = res.places || (Array.isArray(res) ? res : []);
      this.render(items);
    } catch (err) {
      console.error("[NearbyExplorer] Error fetching nearby places:", err);
      container.innerHTML = `
        <div class="card" style="background:#FEF2F2;border-color:#FCA5A5;padding:16px;">
          <div style="font-weight:800;color:#DC2626;">Could not load nearby places</div>
          <div style="font-size:12px;color:#B91C1C;margin-top:2px;">Please check network connection.</div>
        </div>
      `;
    }
  },

  render(places) {
    const container = document.getElementById('nearbyResults');
    if (!container) return;

    if (!places || places.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:8px;">🔍</div>
          <div style="font-weight:800;color:var(--text-primary);">No locations found</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Try expanding the search radius slider or changing category.</div>
        </div>
      `;
      return;
    }

    const categoryIcons = {
      attraction: '🏛️',
      food: '🍲',
      hospital: '🏥',
      police: '👮',
      atm: '🏧',
      hotel: '🏨',
      toilet: '🚻'
    };

    container.innerHTML = places.map(p => {
      const icon = categoryIcons[p.category] || '📍';
      const dist = p.distance_km ? `${p.distance_km.toFixed(1)} km away` : 'Nearby';
      const fee = p.entry_fee_inr === 0 ? 'Free Entry' : (p.entry_fee_inr ? `₹${p.entry_fee_inr}` : '');

      return `
        <div class="card" style="margin-bottom:10px;padding:12px;">
          <div style="display:flex;gap:12px;align-items:flex-start;">
            ${p.image_url ? `<img src="${p.image_url}" style="width:72px;height:72px;border-radius:10px;object-fit:cover;flex-shrink:0;">` : `<div style="width:48px;height:48px;border-radius:10px;background:var(--bg-surface-2);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">${icon}</div>`}
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <h4 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${p.name}
                </h4>
                ${fee ? `<span class="badge ${fee === 'Free Entry' ? 'badge-green' : 'badge-amber'}" style="flex-shrink:0;margin-left:6px;">${fee}</span>` : ''}
              </div>
              <div style="font-size:11px;color:var(--blue);font-weight:700;margin-top:2px;">
                📍 ${dist} · <span style="text-transform:capitalize;color:var(--text-muted);">${p.category}</span>
              </div>
              <p style="font-size:11px;color:var(--text-secondary);margin:4px 0 8px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${p.description || p.short_description || ''}
              </p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button onclick="App.openDirections('${p.id}')" class="btn btn-xs btn-primary" style="width:auto;">🧭 Route</button>
                <button onclick="App.launchAR('${p.id}','${p.name.replace(/'/g, "\\'")}',${p.lat},${p.lng})" class="btn btn-xs btn-secondary" style="width:auto;">📱 AR</button>
                <button onclick="App.openGuide('${p.id}')" class="btn btn-xs btn-secondary" style="width:auto;">🎧 Guide</button>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" class="btn btn-xs btn-secondary" style="width:auto;text-decoration:none;">🚀 Maps App</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
};
