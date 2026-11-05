/**
 * TravelMate AI – AI Smart Trip Planner Module v2.0
 * Generates personalized itineraries and handles real-time delay recalculation.
 */

const TripPlannerModule = {
  currentPlan: null,

  init() {},

  async generateTrip() {
    const days = parseInt(document.getElementById('planDays')?.value || 1);
    const budget = parseFloat(document.getElementById('planBudget')?.value || 2000);
    const start_time = document.getElementById('planStart')?.value || '09:00';
    const travel_mode = document.getElementById('planMode')?.value || 'Affordable (Metro / Auto)';
    const companions = document.getElementById('planCompanion')?.value || 'Solo';

    const interests = [];
    document.querySelectorAll('.int-cb:checked').forEach(cb => {
      interests.push(cb.value);
    });

    if (interests.length === 0) {
      interests.push('Heritage', 'Food', 'Photography');
    }

    const resultsEl = document.getElementById('plannerResults');
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:8px;">🤖</div>
          <div style="font-weight:800;color:var(--text-primary);margin-bottom:4px;">Crafting Personalized Itinerary...</div>
          <div style="font-size:12px;color:var(--text-muted);">Optimizing routes, opening hours, and budget for Hyderabad</div>
        </div>
      `;
    }

    try {
      const response = await ApiClient.generateItinerary({
        destination: "Hyderabad",
        days: days,
        budget: budget,
        interests: interests,
        start_time: start_time,
        travel_mode: travel_mode,
        companions: companions,
        preferred_language: "en"
      });

      this.currentPlan = response;
      this.renderItinerary(response);
      App.toast("✨ AI Itinerary generated successfully!", "success");
    } catch (err) {
      console.error("[TripPlanner] Failed to generate itinerary:", err);
      if (resultsEl) {
        resultsEl.innerHTML = `
          <div class="card" style="background:#FEF2F2;border-color:#FCA5A5;padding:16px;">
            <div style="font-weight:800;color:#DC2626;margin-bottom:4px;">Could not generate itinerary</div>
            <div style="font-size:12px;color:#B91C1C;">${err.message || 'Please check your inputs and try again.'}</div>
          </div>
        `;
      }
    }
  },

  renderItinerary(data) {
    const resultsEl = document.getElementById('plannerResults');
    if (!resultsEl || !data) return;

    let html = `
      <div class="card" style="margin-bottom:12px;background:linear-gradient(135deg, #0A1128 0%, #0072CE 100%);color:#FFF;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div>
            <span class="badge badge-cyan" style="margin-bottom:4px;">${data.destination} · ${data.days} Day Plan</span>
            <h3 style="font-size:18px;font-weight:900;color:#FFF;margin-top:4px;">AI Optimized Travel Plan</h3>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:900;color:#00E5FF;">₹${data.total_estimated_cost_inr}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.75);">Est. Expenses</div>
          </div>
        </div>
        <p style="font-size:12px;color:rgba(255,255,255,0.85);line-height:1.4;margin-bottom:10px;">${data.summary}</p>
        <div style="display:flex;gap:8px;">
          <button onclick="TripPlannerModule.openDelayModal()" class="btn btn-xs" style="background:rgba(255,255,255,0.2);color:#FFF;border:1px solid rgba(255,255,255,0.3);flex:1;">⏱️ Recalculate Delay</button>
          <button onclick="App.nav('mapScreen')" class="btn btn-xs" style="background:#00E5FF;color:#0A1128;font-weight:800;flex:1;">🗺️ View on Map</button>
        </div>
      </div>
    `;

    (data.itinerary || []).forEach(day => {
      html += `
        <div class="card" style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);">
            <div style="font-weight:900;font-size:14px;color:var(--text-primary);">Day ${day.day}: ${day.title}</div>
            <span class="badge badge-blue">₹${day.total_day_budget} · ${day.total_travel_time_min}m travel</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
      `;

      (day.stops || []).forEach((stop, idx) => {
        html += `
          <div style="display:flex;gap:12px;position:relative;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div style="width:28px;height:28px;border-radius:50%;background:var(--blue);color:#FFF;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${stop.sequence}
              </div>
              ${idx < day.stops.length - 1 ? '<div style="width:2px;background:var(--border);flex:1;min-height:24px;margin-top:4px;"></div>' : ''}
            </div>
            <div style="flex:1;padding-bottom:${idx < day.stops.length - 1 ? '8px' : '0'};">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <h4 style="font-size:14px;font-weight:800;color:var(--text-primary);margin:0;">${stop.name}</h4>
                  <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                    🕒 ${stop.arrival_time} – ${stop.departure_time} (${stop.duration_minutes}m)
                  </div>
                </div>
                <span class="badge ${stop.entry_fee_inr === 0 ? 'badge-green' : 'badge-amber'}">
                  ${stop.entry_fee_inr === 0 ? 'Free Entry' : '₹' + stop.entry_fee_inr}
                </span>
              </div>
              <p style="font-size:12px;color:var(--text-secondary);margin:6px 0;line-height:1.4;">${stop.notes}</p>
              <div style="display:flex;gap:6px;margin-top:4px;">
                <button onclick="App.openDirections('${stop.place_id}')" class="btn btn-xs btn-primary" style="width:auto;">🧭 Route</button>
                <button onclick="App.openGuide('${stop.place_id}')" class="btn btn-xs btn-secondary" style="width:auto;">🎧 Guide</button>
                <button onclick="App.launchAR('${stop.place_id}','${stop.name.replace(/'/g, "\\'")}',${stop.lat},${stop.lng})" class="btn btn-xs btn-secondary" style="width:auto;">📱 AR</button>
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
          ${day.tips && day.tips.length ? `
            <div style="margin-top:10px;padding:8px 10px;background:var(--bg-surface-2);border-radius:8px;font-size:11px;color:var(--text-secondary);">
              💡 <b>Local Tip:</b> ${day.tips[0]}
            </div>
          ` : ''}
        </div>
      `;
    });

    resultsEl.innerHTML = html;
  },

  openDelayModal() {
    const modal = document.getElementById('delayModal');
    if (modal) modal.classList.add('open');
  },

  closeDelayModal() {
    const modal = document.getElementById('delayModal');
    if (modal) modal.classList.remove('open');
  },

  async applyDelay(minutes) {
    this.closeDelayModal();
    App.toast(`⏱️ Adjusting itinerary for +${minutes} min delay...`, "info");

    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const updatedStops = await ApiClient.recalculatePlan({
        current_day: 1,
        current_time: timeStr,
        delay_minutes: minutes,
        current_lat: 17.3616,
        current_lng: 78.4747,
        completed_stop_ids: []
      });

      if (this.currentPlan && this.currentPlan.itinerary && this.currentPlan.itinerary[0]) {
        this.currentPlan.itinerary[0].stops = updatedStops;
        this.renderItinerary(this.currentPlan);
        App.toast("✅ Itinerary recalculated with updated times!", "success");
      }
    } catch (err) {
      console.error("[TripPlanner] Failed to recalculate delay:", err);
      App.toast("Could not recalculate delay.", "error");
    }
  }
};
