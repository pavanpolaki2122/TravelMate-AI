/**
 * TravelMate AI – API Client v2.0
 * All backend calls with offline cache fallback.
 */

const BASE = '';  // Same-origin when served by FastAPI

const ApiClient = {

  async _get(path) {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json();
  },

  async _post(path, body) {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }
    return res.json();
  },

  async _delete(path) {
    const res = await fetch(BASE + path, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
    return res.json();
  },

  // === PLACES ===
  getAllPlaces() { return this._get('/api/places/all'); },
  getHiddenPlaces() { return this._get('/api/places/hidden'); },
  getNearby(lat, lng, radius = 20, category = 'all') {
    return this._get(`/api/places/nearby?lat=${lat}&lng=${lng}&radius_km=${radius}${category !== 'all' ? '&category=' + category : ''}`);
  },
  submitHiddenPlace(data) { return this._post('/api/places/hidden/submit', data); },

  // === PLANNER ===
  generateItinerary(params) { return this._post('/api/planner/generate', params); },
  recalculatePlan(data) { return this._post('/api/planner/recalculate', data); },

  // === GUIDE ===
  getMonumentInfo(id) { return this._get(`/api/guide/monument?id=${id}`); },
  askGuide(monument_id, question, language = 'en') {
    return this._post('/api/guide/ask', { place_id: monument_id, monument_id, question, language });
  },

  // === ASSISTANT ===
  chatAssistant(message, history = []) {
    return this._post('/api/guide/assistant/chat', { message, history });
  },

  // === BUDGET ===
  getBudgetItems(userId = 'demo') { return this._get(`/api/budget/items?user_id=${userId}`); },
  addBudgetItem(data) { return this._post('/api/budget/items', data); },
  deleteBudgetItem(id) { return this._delete(`/api/budget/items/${id}`); },

  // === COMMUNITY ===
  getPosts() { return this._get('/api/community/posts'); },
  submitPost(data) { return this._post('/api/community/posts', data); },
  getBuddies() { return this._get('/api/community/buddies'); },
  likePost(postId) { return this._post(`/api/community/posts/${postId}/like`, {}); },

  // === SAFETY ===
  getEmergencyContacts() { return this._get('/api/safety/emergency-contacts'); },
  getNearbyEmergency(lat, lng) { return this._get(`/api/safety/nearby-services?lat=${lat}&lng=${lng}`); },
  triggerSOS(data) { return this._post('/api/safety/sos-trigger', data); },

  // === AUTH ===
  login(email, password) { return this._post('/api/auth/login', { email, password }); },
  register(name, email, password) { return this._post('/api/auth/register', { name, email, password }); },
  updateProfile(data) { return this._post('/api/auth/profile', data); },
};
