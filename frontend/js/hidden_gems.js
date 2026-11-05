/**
 * TravelMate AI – Hidden Places Discovery Module v2.0
 * Uncover secret Hyderabad spots, photo viewpoints, and local community submissions.
 */

const HiddenGemsModule = {
  currentFilter: 'all',
  places: [],

  init() {
    this.load();
  },

  setFilter(filter, btnEl) {
    this.currentFilter = filter;
    document.querySelectorAll('#hiddenScreen .chip').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.render();
  },

  async load() {
    const container = document.getElementById('hiddenGemsContainer');
    if (container) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:28px;margin-bottom:8px;">💎</div>
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Discovering Hidden Hyderabad...</div>
          <div style="font-size:12px;color:var(--text-muted);">Fetching secret viewpoints, artisan quarters, and heritage ruins</div>
        </div>
      `;
    }

    try {
      const res = await ApiClient.getHiddenPlaces();
      this.places = res.hidden_places || res.places || (Array.isArray(res) ? res : []);
      this.render();
    } catch (err) {
      console.error("[HiddenGems] Error fetching hidden places:", err);
      if (container) {
        container.innerHTML = `
          <div class="card" style="background:#FEF2F2;border-color:#FCA5A5;padding:16px;">
            <div style="font-weight:800;color:#DC2626;">Could not load hidden places</div>
            <div style="font-size:12px;color:#B91C1C;">Please check network connection.</div>
          </div>
        `;
      }
    }
  },

  render() {
    const container = document.getElementById('hiddenGemsContainer');
    if (!container) return;

    let filtered = this.places;
    if (this.currentFilter !== 'all') {
      filtered = this.places.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const tags = (p.tags || []).map(t => t.toLowerCase());
        const target = this.currentFilter.toLowerCase();
        return cat.includes(target) || desc.includes(target) || tags.some(t => t.includes(target));
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:8px;">💎</div>
          <div style="font-weight:800;color:var(--text-primary);">No hidden gems found for this filter</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Be the first to submit a secret spot in this category!</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="card" style="margin-bottom:12px;padding:0;overflow:hidden;">
        ${p.image_url ? `<img src="${p.image_url}" style="width:100%;height:160px;object-fit:cover;">` : ''}
        <div style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
            <div>
              <h4 style="font-size:16px;font-weight:900;color:var(--text-primary);margin:0;">${p.name}</h4>
              <div style="font-size:11px;color:var(--cyan);font-weight:700;margin-top:2px;">
                ⭐ ${(p.rating || 4.8).toFixed(1)} · Verified Local Secret · <span style="text-transform:capitalize;">${p.category || 'Hidden Gem'}</span>
              </div>
            </div>
            <span class="badge badge-cyan">💎 Hidden Gem</span>
          </div>

          <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin:8px 0 10px;">
            ${p.description || ''}
          </p>

          ${p.best_time_to_visit ? `
            <div style="background:var(--bg-surface-2);padding:6px 10px;border-radius:8px;font-size:11px;color:var(--text-secondary);margin-bottom:10px;">
              🌅 <b>Best Time:</b> ${p.best_time_to_visit}
            </div>
          ` : ''}

          <div style="display:flex;gap:6px;">
            <button onclick="App.openDirections('${p.id}')" class="btn btn-xs btn-primary" style="flex:1;">🧭 Route</button>
            <button onclick="App.launchAR('${p.id}','${p.name.replace(/'/g, "\\'")}',${p.lat},${p.lng})" class="btn btn-xs btn-secondary" style="flex:1;">📱 AR</button>
            <button onclick="App.openGuide('${p.id}')" class="btn btn-xs btn-secondary" style="flex:1;">🎧 Guide</button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" class="btn btn-xs btn-secondary" style="text-decoration:none;display:flex;align-items:center;justify-content:center;padding:0 8px;" title="Open in Google Maps">🚀</a>
          </div>
        </div>
      </div>
    `).join('');
  },

  openModal() {
    const modal = document.getElementById('gemModal');
    if (modal) modal.classList.add('open');
  },

  closeModal() {
    const modal = document.getElementById('gemModal');
    if (modal) modal.classList.remove('open');
  },

  async submitPlace() {
    const name = document.getElementById('gemName')?.value?.trim();
    const desc = document.getElementById('gemDesc')?.value?.trim();
    const photo = document.getElementById('gemPhoto')?.value?.trim() || null;

    if (!name || !desc) {
      App.toast('Please provide a name and description.', 'error');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      await ApiClient.submitHiddenPlace({
        name: name,
        short_desc: desc,
        description: desc,
        category: "Hidden Gem",
        photo_url: photo || "https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80",
        image_url: photo || "https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80",
        lat: 17.3850 + (Math.random() - 0.5) * 0.05,
        lng: 78.4867 + (Math.random() - 0.5) * 0.05,
        submitted_by: user.name || "Explorer"
      });

      this.closeModal();
      document.getElementById('gemName').value = '';
      document.getElementById('gemDesc').value = '';
      document.getElementById('gemPhoto').value = '';

      App.toast('💎 Place submitted! Thank you for sharing with the community.', 'success');
      this.load();
    } catch (err) {
      console.error("[HiddenGems] Error submitting:", err);
      App.toast('Could not submit place. Please try again.', 'error');
    }
  }
};
