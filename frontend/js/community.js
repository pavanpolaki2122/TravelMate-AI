/**
 * TravelMate AI – Tourist Community Module v2.0
 * Community travel experiences, photo stories, and real-time travel buddy matchmaking.
 */

const CommunityModule = {
  posts: [],
  buddies: [],

  init() {
    this.load();
    this.loadBuddies();
  },

  async load() {
    const feed = document.getElementById('communityFeed');
    if (feed) {
      feed.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:28px;margin-bottom:8px;">💬</div>
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Loading Community Stories...</div>
          <div style="font-size:12px;color:var(--text-muted);">Tips, verified reviews, and hidden viewpoints from Hyderabad travelers</div>
        </div>
      `;
    }

    try {
      const res = await ApiClient.getPosts();
      this.posts = res.posts || [];
      this.renderFeed();
    } catch (err) {
      console.error("[Community] Error fetching posts:", err);
      if (feed) {
        feed.innerHTML = `
          <div class="card" style="background:#FEF2F2;border-color:#FCA5A5;padding:16px;">
            <div style="font-weight:800;color:#DC2626;">Could not load community feed</div>
            <div style="font-size:12px;color:#B91C1C;">Please check network connection.</div>
          </div>
        `;
      }
    }
  },

  renderFeed() {
    const feed = document.getElementById('communityFeed');
    if (!feed) return;

    if (!this.posts || this.posts.length === 0) {
      feed.innerHTML = `
        <div class="card" style="text-align:center;padding:24px;">
          <div style="font-size:32px;margin-bottom:8px;">✍️</div>
          <div style="font-weight:800;color:var(--text-primary);">No stories shared yet</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Share your Hyderabad experience above to start the community!</div>
        </div>
      `;
      return;
    }

    feed.innerHTML = this.posts.map(post => {
      const initials = (post.author || 'T').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const stars = '⭐'.repeat(post.rating || 5);

      return `
        <div class="card" style="margin-bottom:12px;padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div style="display:flex;gap:10px;align-items:center;">
              <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--cyan));color:#FFF;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;">
                ${initials}
              </div>
              <div>
                <div style="font-size:13px;font-weight:800;color:var(--text-primary);">${post.author}</div>
                <div style="font-size:11px;color:var(--blue);font-weight:700;">📍 ${post.location_name}</div>
              </div>
            </div>
            <span style="font-size:11px;">${stars}</span>
          </div>

          <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin:8px 0 10px;">
            ${post.content}
          </p>

          ${post.image_url ? `
            <img src="${post.image_url}" style="width:100%;height:180px;object-fit:cover;border-radius:10px;margin-bottom:10px;">
          ` : ''}

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border);">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${(post.tags || []).map(t => `<span class="badge badge-blue" style="font-size:10px;">#${t}</span>`).join('')}
            </div>
            <button onclick="CommunityModule.likePost('${post.id}')" style="background:none;border:none;cursor:pointer;font-size:12px;font-weight:700;color:var(--text-secondary);display:flex;align-items:center;gap:4px;">
              ❤️ <span>${post.likes || 0}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async submitPost() {
    const loc = document.getElementById('postLocation')?.value?.trim();
    const content = document.getElementById('postContent')?.value?.trim();

    if (!content) {
      App.toast('Please write a message to share.', 'error');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      await ApiClient.submitPost({
        author: user.name || "Jayasree Tourist",
        location_name: loc || "Hyderabad",
        content: content,
        tags: ["Hyderabad", "TravelMate"],
        rating: 5,
        image_url: null
      });

      document.getElementById('postLocation').value = '';
      document.getElementById('postContent').value = '';

      App.toast('🎉 Experience shared with TravelMate Community!', 'success');
      this.load();
    } catch (err) {
      console.error("[Community] Error posting:", err);
      App.toast('Failed to post story. Please try again.', 'error');
    }
  },

  async likePost(postId) {
    try {
      await ApiClient.likePost(postId);
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.likes = (post.likes || 0) + 1;
        this.renderFeed();
      }
    } catch (err) {
      console.warn("[Community] Could not like post:", err);
    }
  },

  async loadBuddies() {
    const container = document.getElementById('buddyScroll');
    if (!container) return;

    try {
      const res = await ApiClient.getBuddies();
      this.buddies = res.buddies || [];
      this.renderBuddies();
    } catch (err) {
      console.warn("[Community] Could not load travel buddies:", err);
    }
  },

  renderBuddies() {
    const container = document.getElementById('buddyScroll');
    if (!container) return;

    if (!this.buddies || this.buddies.length === 0) {
      container.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px;">Finding travel buddies in Hyderabad...</div>';
      return;
    }

    container.innerHTML = this.buddies.map(b => {
      const initials = (b.name || 'B').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      return `
        <div style="flex:0 0 160px;background:var(--bg-surface);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center;">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--purple),var(--blue));color:#FFF;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;margin:0 auto 8px;">
            ${initials}
          </div>
          <div style="font-size:13px;font-weight:800;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${b.name}
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px;">
            📍 ${b.current_city || 'Hyderabad'}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;justify-content:center;margin-bottom:8px;">
            ${(b.interests || []).slice(0, 2).map(i => `<span class="badge badge-cyan" style="font-size:9px;padding:2px 5px;">${i}</span>`).join('')}
          </div>
          <button onclick="App.toast('👋 Connection request sent to ${b.name.replace(/'/g, "\\'")}!','success')" class="btn btn-xs btn-primary" style="width:100%;font-size:10px;">
            Connect
          </button>
        </div>
      `;
    }).join('');
  }
};
