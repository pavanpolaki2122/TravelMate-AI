/**
 * TravelMate AI – Live AI Assistant v2.0
 * Gemini 3.8 Flash powered chat with voice input.
 */

const LiveAssistant = {
  history: [],
  listening: false,
  recognition: null,

  init() {
    // Initialize speech recognition if available
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      this.recognition = new SR();
      this.recognition.lang = 'en-IN';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        const inp = document.getElementById('chatInput');
        if (inp) inp.value = text;
        this.send(text);
      };
      this.recognition.onend = () => {
        this.listening = false;
        const btn = document.getElementById('micBtn');
        if (btn) btn.classList.remove('active');
      };
      this.recognition.onerror = () => {
        this.listening = false;
        const btn = document.getElementById('micBtn');
        if (btn) btn.classList.remove('active');
        App.toast('Voice input error. Please try again.', 'error');
      };
    }
  },

  async send(text) {
    const inp = document.getElementById('chatInput');
    const msg = text || (inp ? inp.value.trim() : '');
    if (!msg) return;
    if (inp) inp.value = '';

    // Add user message
    this._addMsg(msg, 'user');
    this.history.push({ role: 'user', content: msg });

    // Show typing indicator
    const typingId = this._addTyping();

    try {
      const data = await ApiClient.chatAssistant(msg, this.history.slice(-8));
      this._removeTyping(typingId);
      const reply = data.response || data.message || 'Sorry, I could not process that. Please try again.';
      this._addMsg(reply, 'ai');
      this.history.push({ role: 'assistant', content: reply });
    } catch(e) {
      this._removeTyping(typingId);
      this._addMsg('⚠️ AI assistant is temporarily unavailable. Please check your connection.', 'ai');
    }
  },

  _addMsg(text, role) {
    const c = document.getElementById('chatMsgs');
    if (!c) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = `msg msg-${role}`;
    div.innerHTML = `
      <div class="msg-bubble">${this._formatText(text)}</div>
      <div class="msg-time">${now}</div>
    `;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
  },

  _addTyping() {
    const c = document.getElementById('chatMsgs');
    if (!c) return null;
    const id = 'typing_' + Date.now();
    const div = document.createElement('div');
    div.className = 'msg msg-ai';
    div.id = id;
    div.innerHTML = `<div class="msg-bubble" style="display:flex;gap:5px;align-items:center;">
      <span style="width:7px;height:7px;background:#94A3B8;border-radius:50%;animation:pulse 0.6s infinite;"></span>
      <span style="width:7px;height:7px;background:#94A3B8;border-radius:50%;animation:pulse 0.6s 0.2s infinite;"></span>
      <span style="width:7px;height:7px;background:#94A3B8;border-radius:50%;animation:pulse 0.6s 0.4s infinite;"></span>
    </div>`;
    c.appendChild(div);
    c.scrollTop = c.scrollHeight;
    return id;
  },

  _removeTyping(id) {
    if (id) { const e = document.getElementById(id); if(e) e.remove(); }
  },

  _formatText(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\*(.*?)\*/g, '<i>$1</i>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  },

  toggleVoice() {
    if (!this.recognition) { App.toast('Voice input not supported in this browser.', 'error'); return; }
    const btn = document.getElementById('micBtn');
    if (this.listening) {
      this.recognition.stop();
      this.listening = false;
      if (btn) btn.classList.remove('active');
    } else {
      this.recognition.start();
      this.listening = true;
      if (btn) btn.classList.add('active');
      App.toast('🎙️ Listening... Speak your question');
    }
  }
};
