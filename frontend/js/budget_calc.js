/**
 * TravelMate AI – Budget Calculator v2.0
 * Real SQLite persistence via backend API.
 */

const BudgetCalculator = {
  limit: 2000,
  items: [],

  init() {
    this.load();
  },

  async load() {
    try {
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      const userId = user.user_id || 'demo';
      const data = await ApiClient.getBudgetItems(userId);
      this.items = data.items || [];
      this._refresh();
    } catch(e) {
      this.items = [];
      this._refresh();
    }
  },

  reload() { this.load(); },

  setBudget(val) {
    this.limit = parseFloat(val) || 2000;
    this._refresh();
  },

  async addExpense() {
    const title  = document.getElementById('expTitle')?.value?.trim();
    const amount = parseFloat(document.getElementById('expAmount')?.value);
    const cat    = document.getElementById('expCat')?.value;
    if (!title || !amount || amount <= 0) { App.toast('Please enter a valid title and amount.', 'error'); return; }

    try {
      const user = JSON.parse(localStorage.getItem('tm_user') || '{}');
      const data = await ApiClient.addBudgetItem({
        user_id: user.user_id || 'demo',
        title, amount, category: cat
      });
      this.items.push(data.item || { id: Date.now(), title, amount, category: cat });
      this._refresh();
      // Clear form
      const t = document.getElementById('expTitle'); if(t) t.value = '';
      const a = document.getElementById('expAmount'); if(a) a.value = '';
      App.toast(`₹${amount} logged! 💳`, 'success');
    } catch(e) {
      // Fallback: add locally
      this.items.push({ id: Date.now(), title, amount, category: cat });
      this._refresh();
      App.toast(`₹${amount} logged locally.`, 'success');
    }
  },

  async deleteItem(id) {
    try {
      await ApiClient.deleteBudgetItem(id);
    } catch(e) {}
    this.items = this.items.filter(i => i.id !== id);
    this._refresh();
    App.toast('Expense removed.');
  },

  _refresh() {
    const spent = this.items.reduce((s, i) => s + (i.amount || 0), 0);
    const remaining = this.limit - spent;
    const pct = this.limit > 0 ? Math.min(100, Math.round((spent / this.limit) * 100)) : 0;

    // Stats
    const sv = document.getElementById('bSpent'); if(sv) sv.textContent = '₹' + spent.toFixed(0);
    const rv = document.getElementById('bRemain'); if(rv) { rv.textContent = '₹' + Math.max(0, remaining).toFixed(0); rv.style.color = remaining < 0 ? 'var(--red)' : 'var(--green)'; }
    const pv = document.getElementById('bPct'); if(pv) { pv.textContent = pct + '%'; pv.style.color = pct > 100 ? 'var(--red)' : pct > 80 ? 'var(--amber)' : 'var(--green)'; }

    // Progress bar
    const bar = document.getElementById('budgetBar');
    if (bar) {
      bar.style.width = pct + '%';
      bar.className = 'prog-fill' + (pct > 100 ? ' danger' : pct > 80 ? ' warn' : '');
    }

    // Alert
    const alert = document.getElementById('budgetAlert');
    if (alert) {
      if (pct > 100) {
        alert.style.display = 'block';
        alert.style.background = '#FEF2F2';
        alert.style.borderColor = '#FCA5A5';
        alert.innerHTML = `<div style="font-weight:800;font-size:13px;color:#DC2626;">🚨 Over Budget! Overspent by ₹${Math.abs(remaining).toFixed(0)}</div><div style="font-size:11px;color:#B91C1C;margin-top:2px;">Consider cheaper transport options or skip a meal.</div>`;
      } else if (pct > 80) {
        alert.style.display = 'block';
        alert.style.background = '#FFFBEB';
        alert.style.borderColor = '#FDE68A';
        alert.innerHTML = `<div style="font-weight:800;font-size:13px;color:#D97706;">⚠️ ${pct}% Budget Used</div><div style="font-size:11px;color:#B45309;margin-top:2px;">Only ₹${remaining.toFixed(0)} remaining. Watch your spending.</div>`;
      } else {
        alert.style.display = 'block';
        alert.style.background = '#ECFDF5';
        alert.style.borderColor = '#A7F3D0';
        alert.innerHTML = `<div style="font-weight:800;font-size:13px;color:#059669;">✅ Budget on Track — ${pct}% used</div><div style="font-size:11px;color:#047857;margin-top:2px;">₹${remaining.toFixed(0)} remaining. You're doing great!</div>`;
      }
    }

    // Expense list
    const list = document.getElementById('expenseList');
    if (list) {
      const catEmoji = { food: '🍲', transit: '🚇', entry: '🎟️', stay: '🏨', shopping: '🛍️', misc: '📦' };
      list.innerHTML = this.items.length ? this.items.map(i => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);">
          <span style="font-size:20px;flex-shrink:0;">${catEmoji[i.category] || '📦'}</span>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${i.title}</div>
            <div style="font-size:10px;color:var(--text-muted);text-transform:capitalize;">${i.category}</div>
          </div>
          <span style="font-size:14px;font-weight:900;color:var(--blue);flex-shrink:0;">₹${parseFloat(i.amount).toFixed(0)}</span>
          <button onclick="BudgetCalculator.deleteItem(${i.id})" style="background:none;border:none;cursor:pointer;color:var(--red);font-size:16px;flex-shrink:0;padding:4px;" title="Remove">🗑️</button>
        </div>
      `).join('') : '<div style="text-align:center;color:var(--text-muted);font-size:12px;padding:16px;">No expenses logged yet. Add your first expense above!</div>';
    }

    // Update budget limit input if changed externally
    const li = document.getElementById('budgetLimit');
    if (li && li !== document.activeElement) li.value = this.limit;
  }
};
