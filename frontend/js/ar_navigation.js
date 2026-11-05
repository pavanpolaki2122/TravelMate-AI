/**
 * TravelMate AI – AR Navigation Module v2.0
 * Live camera stream HUD overlay with compass bearing and real-time distance tracking.
 */

const ARNavigation = {
  videoElement: null,
  stream: null,
  currentTarget: {
    id: "hyd-charminar",
    name: "Charminar",
    lat: 17.3616,
    lng: 78.4747,
    short_desc: "Walk towards the main archway. Keep camera forward."
  },
  userHeading: 45,
  userLat: 17.3616,
  userLng: 78.4747,
  watchId: null,

  init() {
    this.videoElement = document.getElementById("arVideo");
    this.setupSensors();
  },

  start() {
    this.init();
    this.requestCamera();
    this.updateHUD();
  },

  stop() {
    this.stopCamera();
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  },

  async requestCamera() {
    this.videoElement = document.getElementById("arVideo");
    if (!this.videoElement) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        this.videoElement.srcObject = this.stream;
        App.toast("📷 AR Camera connected!", "success");
      } else {
        throw new Error("Camera not supported on this browser.");
      }
    } catch (err) {
      console.warn("[ARNavigation] Camera stream unavailable:", err.message);
      if (this.videoElement) {
        this.videoElement.poster = "https://images.unsplash.com/photo-1572445271230-a78b5944a659?auto=format&fit=crop&w=800&q=80";
      }
      App.toast("Camera simulation mode active (live feed unavailable)", "info");
    }
  },

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  },

  setupSensors() {
    // Device orientation for compass
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        if (e.webkitCompassHeading !== undefined) {
          this.userHeading = Math.round(e.webkitCompassHeading);
        } else if (e.alpha !== null) {
          this.userHeading = Math.round(360 - e.alpha);
        }
        this.updateHUD();
      }, true);
    }

    // Geolocation watch
    if (navigator.geolocation) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.updateHUD();
        },
        () => {
          // Default to central Hyderabad coords for simulation
          this.userLat = 17.3700;
          this.userLng = 78.4700;
          this.updateHUD();
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 3000 }
      );
    }
  },

  setDest(id, name, lat, lng) {
    this.currentTarget = {
      id: id,
      name: name,
      lat: lat,
      lng: lng,
      short_desc: `Navigating to ${name}. Follow the AR directional reticle.`
    };

    // Update chip active state
    document.querySelectorAll('#arScreen .chip').forEach(c => {
      if (c.textContent.includes(name.split(' ')[0])) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    this.updateHUD();
    App.toast(`🎯 Destination set: ${name}`, "info");
  },

  setTarget(id, name, lat, lng) {
    this.setDest(id, name, lat, lng);
  },

  openGuide() {
    if (this.currentTarget && this.currentTarget.id) {
      App.openGuide(this.currentTarget.id);
    } else {
      App.openGuide('hyd-charminar');
    }
  },

  updateHUD() {
    const bearingEl = document.getElementById("arBearing");
    const arrowEl = document.getElementById("arArrow");
    const distEl = document.getElementById("arDist");
    const nameEl = document.getElementById("arPlaceName");
    const descEl = document.getElementById("arPlaceDesc");

    if (nameEl) nameEl.textContent = this.currentTarget.name;
    if (descEl) descEl.textContent = this.currentTarget.short_desc;

    // Calculate distance and bearing to destination
    const distKm = this.calcDistance(this.userLat, this.userLng, this.currentTarget.lat, this.currentTarget.lng);
    const targetBearing = this.calcBearing(this.userLat, this.userLng, this.currentTarget.lat, this.currentTarget.lng);

    if (distEl) {
      if (distKm < 1) {
        distEl.textContent = `${Math.round(distKm * 1000)} m`;
      } else {
        distEl.textContent = `${distKm.toFixed(1)} km`;
      }
    }

    // Relative direction
    const relativeAngle = (targetBearing - this.userHeading + 360) % 360;
    let arrow = "⬆️";
    if (relativeAngle > 45 && relativeAngle <= 135) arrow = "➡️";
    else if (relativeAngle > 135 && relativeAngle <= 225) arrow = "⬇️";
    else if (relativeAngle > 225 && relativeAngle <= 315) arrow = "⬅️";

    if (arrowEl) arrowEl.textContent = arrow;

    // Compass text
    const cardinal = this.getCardinal(this.userHeading);
    if (bearingEl) bearingEl.textContent = `${String(this.userHeading).padStart(3, '0')}° ${cardinal}`;
  },

  calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  calcBearing(lat1, lon1, lat2, lon2) {
    const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return Math.round((brng + 360) % 360);
  },

  getCardinal(angle) {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const ix = Math.round(angle / 45) % 8;
    return dirs[ix];
  }
};
