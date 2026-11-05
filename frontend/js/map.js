/**
 * TravelMate AI – Real-World Map & Directions Module v4.0
 * Powered by Google Maps Platform JavaScript API with DirectionsService & DirectionsRenderer.
 * Features:
 *  - To / From interactive routing between live GPS and Hyderabad destinations
 *  - Real-world route polyline rendering in Sunset Fire Orange (#FF6E00)
 *  - Multi-modal routing: Driving, Metro/Transit, Walking, Two-Wheeler
 *  - Turn-by-turn navigation steps accordion
 *  - 1-click "Open in Google Maps App" external launcher
 *  - Leaflet fail-safe fallback with distance & estimated transit calculation
 */

const MapModule = {
  map: null,
  isGoogleMap: false,
  markers: [],
  googleMarkers: [],
  infoWindow: null,
  userMarker: null,
  userLoc: { lat: 17.3616, lng: 78.4747 },
  allPlaces: [],
  activeCat: 'all',
  selectedPlace: null,
  containerId: 'mapViewport',

  // Directions & Routing state
  directionsService: null,
  directionsRenderer: null,
  leafletPolyline: null,
  currentTravelMode: 'DRIVING',
  currentRouteResult: null,

  init(containerId = 'mapViewport') {
    this.containerId = containerId;
    this._detectLocation(() => this._buildMap());
  },

  _detectLocation(cb) {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this.userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          cb();
        },
        () => cb(),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      cb();
    }
  },

  _buildMap() {
    const el = document.getElementById(this.containerId);
    if (!el) return;

    if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
      this._buildGoogleMap(el);
    } else {
      this._buildLeafletMap(el);
    }
  },

  _buildGoogleMap(el) {
    try {
      this.isGoogleMap = true;
      el.innerHTML = '';

      this.map = new google.maps.Map(el, {
        center: this.userLoc,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "simplified" }] }
        ]
      });

      this.infoWindow = new google.maps.InfoWindow();

      // Directions Service & Renderer
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#FF6E00",
          strokeWeight: 6,
          strokeOpacity: 0.85
        }
      });

      // User GPS location marker
      this.userMarker = new google.maps.Marker({
        position: this.userLoc,
        map: this.map,
        title: "You are here (Live GPS)",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#0072CE",
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 3
        }
      });

      console.log("[MapModule] Google Maps Platform + Directions initialized successfully!");
      App.toast("🗺️ Google Maps + Route Engine connected!", "success");
      this._loadPlaces();
    } catch (err) {
      console.warn("[MapModule] Google Maps error, falling back to Leaflet:", err);
      this._buildLeafletMap(el);
    }
  },

  _buildLeafletMap(el) {
    this.isGoogleMap = false;
    if (this.map && typeof this.map.remove === 'function') {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(this.containerId, { zoomControl: false })
      .setView([this.userLoc.lat, this.userLoc.lng], 13);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    const userIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;inset:0;background:rgba(0,114,206,0.25);border-radius:50%;animation:pulse-ring 1.5s infinite;"></div>
        <div style="position:absolute;top:5px;left:5px;width:18px;height:18px;background:#0072CE;border:3px solid #FFF;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    this.userMarker = L.marker([this.userLoc.lat, this.userLoc.lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('<b>📍 You are here</b><br><small>Live GPS Active</small>');

    this._loadPlaces();
  },

  async _loadPlaces() {
    try {
      const data = await ApiClient.getAllPlaces();
      this.allPlaces = data.places || [];
      this.renderMarkers();
      this._populateRouteDropdowns();
    } catch (e) {
      console.warn('[MapModule] Places load error:', e);
    }
  },

  _populateRouteDropdowns() {
    const fromSel = document.getElementById('routeFromSelect');
    const toSel = document.getElementById('routeToSelect');
    if (!fromSel || !toSel) return;

    // Preserve first user option in "From"
    fromSel.innerHTML = '<option value="user">📍 My Current Location (Live GPS)</option>';
    toSel.innerHTML = '';

    const sorted = [...this.allPlaces].sort((a, b) => a.name.localeCompare(b.name));

    sorted.forEach(p => {
      const optFrom = document.createElement('option');
      optFrom.value = p.id;
      optFrom.textContent = `${p.name} (${p.category || 'destination'})`;
      fromSel.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = p.id;
      optTo.textContent = `${p.name} (${p.category || 'destination'})`;
      toSel.appendChild(optTo);
    });

    // Default destination: Charminar or first attraction
    const defDest = sorted.find(p => p.id === 'hyd-charminar') || sorted[0];
    if (defDest) toSel.value = defDest.id;
  },

  onRouteChange() {
    // If route results were already showing, recalculate automatically
    const resCard = document.getElementById('routeResultsCard');
    if (resCard && resCard.style.display !== 'none') {
      this.calculateRoute();
    }
  },

  swapLocations() {
    const fromSel = document.getElementById('routeFromSelect');
    const toSel = document.getElementById('routeToSelect');
    if (!fromSel || !toSel) return;

    const currentFrom = fromSel.value;
    const currentTo = toSel.value;

    if (currentFrom === 'user') {
      // Swapping when From is user GPS:
      // Make To = user location (via coordinate/name lookup), and From = currentTo
      fromSel.value = currentTo;
      // Leave To on first destination or alert
      App.toast('Swapped route direction! ⇄');
    } else {
      fromSel.value = currentTo;
      toSel.value = currentFrom;
      App.toast('Swapped route direction! ⇄');
    }
    this.calculateRoute();
  },

  setTravelMode(mode, btn) {
    this.currentTravelMode = mode;
    document.querySelectorAll('.route-mode-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this.calculateRoute();
  },

  calculateRoute() {
    const fromSel = document.getElementById('routeFromSelect');
    const toSel = document.getElementById('routeToSelect');
    if (!fromSel || !toSel) return;

    const fromVal = fromSel.value;
    const toVal = toSel.value;

    // Resolve Origin Coordinates
    let originCoord, originName;
    if (fromVal === 'user') {
      originCoord = this.userLoc;
      originName = "Your GPS Location";
    } else {
      const p = this.allPlaces.find(x => x.id === fromVal);
      if (p) {
        originCoord = { lat: p.lat, lng: p.lng };
        originName = p.name;
      }
    }

    // Resolve Destination Coordinates
    let destCoord, destName;
    const destPlace = this.allPlaces.find(x => x.id === toVal);
    if (destPlace) {
      destCoord = { lat: destPlace.lat, lng: destPlace.lng };
      destName = destPlace.name;
    } else if (toVal === 'user') {
      destCoord = this.userLoc;
      destName = "Your GPS Location";
    }

    if (!originCoord || !destCoord) {
      App.toast("Please select valid origin and destination", "error");
      return;
    }

    App.toast(`Routing: ${originName} ➔ ${destName}...`);

    // Prepare direct Google Maps URL (for native app or web navigation)
    const modeParam = this.currentTravelMode === 'TRANSIT' ? 'transit' :
                      this.currentTravelMode === 'WALKING' ? 'walking' :
                      this.currentTravelMode === 'TWO_WHEELER' ? 'two_wheeler' : 'driving';

    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoord.lat},${originCoord.lng}&destination=${destCoord.lat},${destCoord.lng}&travelmode=${modeParam}`;
    const gmBtn = document.getElementById('btnOpenGoogleMaps');
    if (gmBtn) gmBtn.href = gmapsUrl;

    // Check if Google Maps Directions is active
    if (this.isGoogleMap && this.directionsService && window.google) {
      let gMode = google.maps.TravelMode.DRIVING;
      if (this.currentTravelMode === 'TRANSIT') gMode = google.maps.TravelMode.TRANSIT;
      else if (this.currentTravelMode === 'WALKING') gMode = google.maps.TravelMode.WALKING;
      else if (this.currentTravelMode === 'TWO_WHEELER') gMode = google.maps.TravelMode.DRIVING;

      const req = {
        origin: new google.maps.LatLng(originCoord.lat, originCoord.lng),
        destination: new google.maps.LatLng(destCoord.lat, destCoord.lng),
        travelMode: gMode
      };

      this.directionsService.route(req, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(result);
          this.currentRouteResult = result;
          const leg = result.routes[0].legs[0];
          this._displayRouteResults({
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
            summary: result.routes[0].summary || "Fastest Route",
            steps: leg.steps || [],
            originName,
            destName
          });
          App.toast(`Route found! ${leg.distance.text} · ${leg.duration.text} 🚗`, "success");
        } else {
          console.warn("[MapModule] DirectionsService status:", status, "- using coordinate fallback");
          this._calculateFallbackRoute(originCoord, destCoord, originName, destName);
        }
      });
    } else {
      // Leaflet / Offline mode
      this._calculateFallbackRoute(originCoord, destCoord, originName, destName);
    }
  },

  _calculateFallbackRoute(origin, dest, originName, destName) {
    // Haversine direct distance
    const distKm = this._haversine(origin.lat, origin.lng, dest.lat, dest.lng);
    // Estimated driving road distance (~1.3x straight line)
    const roadDistKm = (distKm * 1.3).toFixed(1);

    // Approximate speed in Hyderabad traffic
    const speeds = { DRIVING: 28, TRANSIT: 22, WALKING: 4.8, TWO_WHEELER: 32 };
    const speed = speeds[this.currentTravelMode] || 28;
    const durMins = Math.max(3, Math.round((roadDistKm / speed) * 60));

    // If using Leaflet map, draw route polyline
    if (!this.isGoogleMap && this.map) {
      if (this.leafletPolyline) {
        this.map.removeLayer(this.leafletPolyline);
      }
      this.leafletPolyline = L.polyline([[origin.lat, origin.lng], [dest.lat, dest.lng]], {
        color: '#FF6E00',
        weight: 5,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(this.map);

      this.map.fitBounds(this.leafletPolyline.getBounds(), { padding: [40, 40] });
    }

    this._displayRouteResults({
      distanceText: `${roadDistKm} km`,
      durationText: durMins >= 60 ? `${Math.floor(durMins/60)} hr ${durMins%60} mins` : `${durMins} mins`,
      summary: "Direct Urban Corridor",
      steps: [
        { instructions: `Depart from ${originName}` },
        { instructions: `Follow arterial roads toward ${destName}` },
        { instructions: `Arrive at destination: ${destName}` }
      ],
      originName,
      destName
    });

    App.toast(`Route estimated: ${roadDistKm} km · ~${durMins}m 🚗`, "success");
  },

  _displayRouteResults(data) {
    const resCard = document.getElementById('routeResultsCard');
    if (!resCard) return;

    resCard.style.display = 'block';

    const distEl = document.getElementById('routeDistance');
    if (distEl) distEl.textContent = data.distanceText;

    const durEl = document.getElementById('routeDuration');
    if (durEl) durEl.textContent = data.durationText;

    const viaEl = document.getElementById('routeVia');
    if (viaEl) viaEl.textContent = data.summary ? `via ${data.summary}` : 'Optimal Route';

    // Populate steps list
    const stepsList = document.getElementById('routeStepsList');
    if (stepsList) {
      stepsList.innerHTML = data.steps.map((s, idx) => {
        const text = s.instructions || s;
        // strip html tags if returned by Google
        const cleanText = text.replace(/<[^>]*>?/gm, ' ');
        return `
          <div class="step-item">
            <span class="step-num">${idx + 1}</span>
            <span>${cleanText}</span>
          </div>
        `;
      }).join('');
    }

    // Scroll smoothly to results card on mobile
    resCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  toggleSteps() {
    const list = document.getElementById('routeStepsList');
    const btn = document.getElementById('btnToggleSteps');
    if (!list) return;

    if (list.style.display === 'none' || !list.style.display) {
      list.style.display = 'block';
      if (btn) btn.textContent = '▲ Hide Steps';
    } else {
      list.style.display = 'none';
      if (btn) btn.textContent = '📜 Turn Directions';
    }
  },

  clearRoute() {
    if (this.directionsRenderer) {
      this.directionsRenderer.set('directions', null);
    }
    if (this.leafletPolyline && this.map) {
      this.map.removeLayer(this.leafletPolyline);
      this.leafletPolyline = null;
    }
    const resCard = document.getElementById('routeResultsCard');
    if (resCard) resCard.style.display = 'none';
    App.toast('Route cleared ✖');
  },

  routeTo(destPlaceId) {
    const toSel = document.getElementById('routeToSelect');
    if (toSel) toSel.value = destPlaceId;

    const fromSel = document.getElementById('routeFromSelect');
    if (fromSel) fromSel.value = 'user';

    this.calculateRoute();
  },

  routeToSelected() {
    if (this.selectedPlace) {
      this.routeTo(this.selectedPlace.id);
    }
  },

  filter(cat, btnEl) {
    this.activeCat = cat;
    document.querySelectorAll('.chip[data-cat]').forEach(c => c.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderMarkers();
  },

  renderMarkers() {
    if (this.isGoogleMap) {
      this._renderGoogleMarkers();
    } else {
      this._renderLeafletMarkers();
    }
  },

  _renderGoogleMarkers() {
    this.googleMarkers.forEach(m => m.setMap(null));
    this.googleMarkers = [];

    const catColors = {
      attraction: '#FF6E00',
      food:       '#F97316',
      hospital:   '#10B981',
      police:     '#8B5CF6',
      atm:        '#F59E0B',
      restroom:   '#64748B',
      default:    '#EF4444'
    };

    const filtered = this.activeCat === 'all'
      ? this.allPlaces
      : this.allPlaces.filter(p => p.category === this.activeCat);

    filtered.forEach(place => {
      if (!place.lat || !place.lng) return;
      const color = catColors[place.category] || catColors.default;

      const marker = new google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: this.map,
        title: place.name,
        icon: {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: color,
          fillOpacity: 1,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
          scale: 1.6,
          anchor: new google.maps.Point(12, 22)
        }
      });

      marker.addListener("click", () => {
        const content = `
          <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:190px;padding:4px;">
            <div style="font-size:14px;font-weight:900;color:#0F172A;margin-bottom:2px;">${place.name}</div>
            <div style="font-size:11px;color:#64748B;margin-bottom:6px;">${place.timings || ''}</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:11px;font-weight:800;color:#F59E0B;">⭐ ${place.rating || 4.8}</span>
              <span style="font-size:11px;color:#10B981;font-weight:800;">${place.entry_fee_inr === 0 ? 'Free Entry' : '₹' + place.entry_fee_inr}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <button onclick="MapModule.routeTo('${place.id}')" style="flex:1;padding:6px;background:linear-gradient(180deg,#FF7B00,#FF5500);color:#FFF;border:none;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;">🧭 Route</button>
              <button onclick="MapModule._selectPlace('${place.id}')" style="flex:1;padding:6px;background:#0072CE;color:#FFF;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">Details</button>
              <button onclick="App.launchAR('${place.id}','${place.name.replace(/'/g, "")}',${place.lat},${place.lng})" style="flex:1;padding:6px;background:#00E5FF;color:#0A1128;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">📱 AR</button>
            </div>
          </div>
        `;
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);
        this._selectPlace(place.id);
      });

      this.googleMarkers.push(marker);
    });
  },

  _renderLeafletMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    const catIcons = {
      attraction: { emoji: '🏛️', color: '#FF6E00' },
      food:       { emoji: '🍲', color: '#F97316' },
      hospital:   { emoji: '🏥', color: '#10B981' },
      police:     { emoji: '👮', color: '#8B5CF6' },
      atm:        { emoji: '🏧', color: '#F59E0B' },
      restroom:   { emoji: '🚻', color: '#64748B' },
      default:    { emoji: '📍', color: '#EF4444' }
    };

    const filtered = this.activeCat === 'all'
      ? this.allPlaces
      : this.allPlaces.filter(p => p.category === this.activeCat);

    filtered.forEach(place => {
      if (!place.lat || !place.lng) return;
      const ci = catIcons[place.category] || catIcons.default;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:34px;height:34px;
          background:${ci.color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          display:flex;align-items:center;justify-content:center;
          border:2.5px solid #FFF;
          box-shadow:0 3px 10px rgba(0,0,0,0.3);
          cursor:pointer;
        ">
          <span style="transform:rotate(45deg);font-size:14px;">${ci.emoji}</span>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -34]
      });

      const marker = L.marker([place.lat, place.lng], { icon })
        .addTo(this.map)
        .bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:180px;">
            <div style="font-size:14px;font-weight:800;color:#0F172A;margin-bottom:3px;">${place.name}</div>
            <div style="font-size:11px;color:#64748B;margin-bottom:6px;">${place.timings || ''}</div>
            <div style="display:flex;gap:4px;margin-bottom:6px;">
              <span style="font-size:10px;font-weight:800;color:#F59E0B;">⭐ ${place.rating}</span>
              <span style="font-size:10px;color:#10B981;font-weight:800;">${place.entry_fee_inr === 0 ? '• Free' : '• ₹' + place.entry_fee_inr}</span>
            </div>
            <div style="display:flex;gap:4px;">
              <button onclick="MapModule.routeTo('${place.id}')" style="flex:1;padding:5px;background:linear-gradient(180deg,#FF7B00,#FF5500);color:#FFF;border:none;border-radius:6px;font-size:11px;font-weight:800;cursor:pointer;">🧭 Route</button>
              <button onclick="MapModule._selectPlace('${place.id}')" style="flex:1;padding:5px;background:#0072CE;color:#FFF;border:none;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">Details</button>
              <button onclick="App.launchAR('${place.id}','${place.name.replace(/'/g, '')}',${place.lat},${place.lng})" style="flex:1;padding:5px;background:#F1F5F9;color:#0F172A;border:1px solid #E2E8F0;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;">AR Nav</button>
            </div>
          </div>
        `);

      this.markers.push(marker);
    });
  },

  _selectPlace(id) {
    const place = this.allPlaces.find(p => p.id === id);
    if (!place) return;
    this.selectedPlace = place;
    const card = document.getElementById('mapInfoCard');
    if (card) {
      card.style.display = 'block';
      document.getElementById('mapInfoName').textContent = place.name;
      document.getElementById('mapInfoDesc').textContent = (place.short_desc || place.description || '').slice(0, 110);
      document.getElementById('mapInfoBadge').textContent = place.category;
      document.getElementById('mapInfoBadge').className = 'badge badge-orange';
    }
  },

  launchAR() {
    if (this.selectedPlace) {
      App.launchAR(this.selectedPlace.id, this.selectedPlace.name, this.selectedPlace.lat, this.selectedPlace.lng);
    }
  },

  openGuide() {
    if (this.selectedPlace) App.openGuide(this.selectedPlace.id);
  },

  centerOnUser() {
    if (this.isGoogleMap && this.map) {
      this.map.panTo(this.userLoc);
      this.map.setZoom(15);
      App.toast('Centered on your location 📍');
    } else if (this.map && this.userLoc) {
      this.map.setView([this.userLoc.lat, this.userLoc.lng], 14, { animate: true });
      App.toast('Centered on your location 📍');
    }
  },

  _haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
};
