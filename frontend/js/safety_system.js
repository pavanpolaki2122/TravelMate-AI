/**
 * TravelMate AI – Tourist Safety System Module v2.0
 * One-tap SOS trigger, emergency broadcasts, and nearby hospital/police locators.
 */

const SafetySystem = {
  userLat: 17.3850,
  userLng: 78.4867,

  init() {
    this.updateLocation();
    this.loadNearbyServices();
  },

  updateLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.loadNearbyServices();
        },
        () => {
          this.userLat = 17.3850;
          this.userLng = 78.4867;
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    }
  },

  async triggerSOS() {
    App.toast("🚨 EMERGENCY SOS BROADCASTING...", "error");

    try {
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      const res = await ApiClient.triggerSOS({
        user_name: user.name || "Traveler",
        lat: this.userLat,
        lng: this.userLng,
        message: "Need urgent emergency assistance!"
      });

      const previewEl = document.getElementById('sosPreview');
      if (previewEl) previewEl.textContent = res.share_text;

      const encoded = encodeURIComponent(res.share_text);
      const waBtn = document.getElementById('sosWA');
      if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${encoded}`;

      const smsBtn = document.getElementById('sosSMS');
      if (smsBtn) smsBtn.href = `sms:?body=${encoded}`;

      const modal = document.getElementById('sosModal');
      if (modal) modal.classList.add('open');
    } catch (err) {
      console.error("[SafetySystem] SOS dispatch error:", err);
      // Fallback local alert
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${this.userLat},${this.userLng}`;
      const fallbackMsg = `🚨 EMERGENCY! I need urgent help. My live GPS location: ${mapLink}`;
      const previewEl = document.getElementById('sosPreview');
      if (previewEl) previewEl.textContent = fallbackMsg;

      const encoded = encodeURIComponent(fallbackMsg);
      const waBtn = document.getElementById('sosWA');
      if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${encoded}`;

      const smsBtn = document.getElementById('sosSMS');
      if (smsBtn) smsBtn.href = `sms:?body=${encoded}`;

      const modal = document.getElementById('sosModal');
      if (modal) modal.classList.add('open');
    }
  },

  closeSOS() {
    const modal = document.getElementById('sosModal');
    if (modal) modal.classList.remove('open');
  },

  async loadNearbyServices() {
    const container = document.getElementById('safetyNearby');
    if (!container) return;

    try {
      const data = await ApiClient.getNearbyEmergency(this.userLat, this.userLng);
      const police = data.nearest_police || [];
      const hospitals = data.nearest_hospitals || [];

      let html = '<div style="display:flex;flex-direction:column;gap:8px;">';

      if (hospitals.length > 0) {
        const h = hospitals[0];
        html += `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-surface-2);border-radius:8px;">
            <div>
              <div style="font-size:13px;font-weight:800;color:var(--text-primary);">🏥 ${h.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${h.distance_km ? h.distance_km.toFixed(1) + ' km away' : 'Nearby'} · Emergency Hospital</div>
            </div>
            <a href="tel:${h.phone || '108'}" class="btn btn-xs btn-primary" style="width:auto;text-decoration:none;">📞 Call</a>
          </div>
        `;
      }

      if (police.length > 0) {
        const p = police[0];
        html += `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg-surface-2);border-radius:8px;">
            <div>
              <div style="font-size:13px;font-weight:800;color:var(--text-primary);">👮 ${p.name}</div>
              <div style="font-size:11px;color:var(--text-muted);">${p.distance_km ? p.distance_km.toFixed(1) + ' km away' : 'Nearby'} · Police Station</div>
            </div>
            <a href="tel:${p.phone || '100'}" class="btn btn-xs btn-secondary" style="width:auto;text-decoration:none;">📞 Call</a>
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;
    } catch (err) {
      console.warn("[SafetySystem] Could not load nearby services:", err);
      container.innerHTML = `
        <div style="font-size:12px;color:var(--text-muted);padding:8px;">
          Speed dial 112 (National Emergency) or 100 (Police) for immediate assistance.
        </div>
      `;
    }
  },

  shareLiveLocation() {
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${this.userLat},${this.userLng}`;
    const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
    const msg = `📍 Hello, this is ${user.name || 'Traveler'} exploring Hyderabad. Sharing my live location: ${mapLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  }
};
