import {
  escapeHtml,
  renderKpiCard,
  renderSvgAreaChart,
  renderSvgBarChart,
  statusBadgeClass,
} from './components.js';
import { computeMetrics, formatDate, formatInr } from './store.js';
import { getSupabaseStatus } from './supabase-adapter.js';

export function renderReportsScreen(state, ui) {
  const m = computeMetrics(state);
  const tab = ui.reportTab || 'Sales Report';
  const period = ui.reportPeriod || '30 Days';

  const rows =
    tab === 'Sales Report'
      ? [
          ['Total Invoices', String(state.invoices.length)],
          ['Gross Sales', formatInr(state.invoices.reduce((s, i) => s + i.totalAmount, 0))],
          ['GST Collected', formatInr(state.invoices.reduce((s, i) => s + i.gstAmount, 0))],
          ['Paid Amount', formatInr(state.invoices.reduce((s, i) => s + i.paidAmount, 0))],
        ]
      : tab === 'Profit Report'
      ? [
          ['Monthly Revenue', formatInr(m.monthlySales)],
          ['Monthly Expenses', formatInr(m.monthlyExpenses)],
          ['Net Profit', formatInr(m.netProfit)],
        ]
      : tab === 'Expense Report'
      ? state.expenses.map((e) => [e.category + ' — ' + e.title, formatInr(e.amount)])
      : tab === 'Inventory Report'
      ? [
          ['Total SKUs', String(m.totalProducts)],
          ['Total Stock Value', formatInr(m.totalStockValue)],
          ['Low Stock Items', String(m.lowStockCount)],
          ['Out of Stock Items', String(m.outOfStockCount)],
        ]
      : tab === 'Customer Report'
      ? state.customers.map((c) => [c.name, `${formatInr(c.totalPurchases)} (Due ${formatInr(c.pendingBalance)})`])
      : state.payments.map((p) => [`${p.method} • ${p.customerName}`, formatInr(p.amount)]);

  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div><h2>Business Reports</h2><div style="font-size:13px;color:var(--text-muted);">Period: ${escapeHtml(period)}</div></div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" id="btn-export-csv"><i data-lucide="download" style="width:16px;height:16px;"></i> Export CSV</button>
          <button class="btn btn-primary btn-sm" id="btn-export-pdf"><i data-lucide="printer" style="width:16px;height:16px;"></i> Export PDF</button>
        </div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['Sales Report', 'Profit Report', 'Expense Report', 'Inventory Report', 'Customer Report', 'Payment Report']
          .map((t) => `<button class="btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}" data-rep-tab="${t}">${t}</button>`)
          .join('')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['Today', '7 Days', '30 Days', 'Month', 'Year', 'Custom']
          .map((p) => `<button class="btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}" data-rep-period="${p}">${p}</button>`)
          .join('')}
      </div>

      <div class="card">
        <h3 style="margin-bottom:12px;">${escapeHtml(tab)} Visualization</h3>
        ${tab === 'Expense Report' ? renderSvgBarChart(m.expenseSeries, '#D97706') : renderSvgAreaChart(m.salesSeries)}
      </div>

      <div class="card">
        <h3 style="margin-bottom:10px;">Summary Table</h3>
        <table class="data-table">
          <tbody>
            ${rows.map(([k, v]) => `<tr><td style="color:var(--text-muted);">${escapeHtml(k)}</td><td style="text-align:right;font-weight:700;">${escapeHtml(v)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderSettingsScreen(state) {
  const p = state.profile;
  const supa = getSupabaseStatus();
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <h2>Business & App Settings</h2>
      <form id="settings-form" class="grid grid-2">
        <div class="card">
          <h3 style="margin-bottom:12px;">Business Profile</h3>
          <div class="field"><label>Business Name</label><input class="input" name="businessName" value="${escapeHtml(p.businessName)}" /></div>
          <div class="field"><label>GSTIN</label><input class="input mono" name="gstin" value="${escapeHtml(p.gstin)}" /></div>
          <div class="field"><label>Address</label><input class="input" name="address" value="${escapeHtml(p.address)}" /></div>
          <div class="field"><label>Phone</label><input class="input" name="mobile" value="${escapeHtml(p.mobile)}" /></div>
          <div class="field"><label>Email</label><input class="input" name="email" value="${escapeHtml(p.email)}" /></div>
          <div class="field"><label>UPI ID</label><input class="input mono" name="upiId" value="${escapeHtml(p.upiId)}" /></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          <div class="card">
            <h3 style="margin-bottom:12px;">Invoice & Preferences</h3>
            <div class="field"><label>Invoice Prefix</label><input class="input mono" name="invoicePrefix" value="${escapeHtml(p.invoicePrefix)}" /></div>
            <div class="field">
              <label>Currency</label>
              <select class="select" name="currency">
                <option ${p.currency === 'INR (₹)' ? 'selected' : ''}>INR (₹)</option>
                <option ${p.currency === 'USD ($)' ? 'selected' : ''}>USD ($)</option>
              </select>
            </div>
            <button class="btn btn-primary btn-block" type="submit">Save Settings</button>
          </div>
          <div class="card">
            <h3 style="margin-bottom:10px;">Account & Backend Sync</h3>
            <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px;">Status: <strong>${escapeHtml(supa.label)}</strong></p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
              <button type="button" class="btn btn-outline btn-sm" id="btn-toggle-theme">Toggle ${state.session.darkMode ? 'Light' : 'Dark'} Mode</button>
              <button type="button" class="btn btn-outline btn-sm" id="btn-toggle-lang">Language: ${state.session.language === 'hi' ? 'हिन्दी' : 'English'}</button>
            </div>
            <button type="button" class="btn btn-danger btn-block" id="btn-logout">Logout</button>
          </div>
        </div>
      </form>
    </div>
  `;
}

export function renderSubscriptionScreen(state) {
  const s = state.subscription;
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <h2>Subscription Plan</h2>
      <div class="card" style="background:var(--primary-soft);border:2px solid var(--primary);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <span class="badge ${statusBadgeClass(s.status)}">${escapeHtml(s.status)}</span>
            <h2 style="margin-top:8px;">${escapeHtml(s.planName)}</h2>
            <div class="font-display" style="font-size:32px;font-weight:800;color:var(--primary);">₹${s.priceInr}<span style="font-size:15px;color:var(--text-muted);">/month</span></div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;color:var(--text-muted);">Trial Status: <strong>${s.status === 'TRIAL' ? `${s.trialDaysLeft} days left` : 'Active Pro'}</strong></div>
            <div style="font-size:13px;color:var(--text-muted);margin:4px 0 12px;">Expiry: <strong>${formatDate(s.expiryDateMillis)}</strong></div>
            <button class="btn btn-primary" id="btn-renew-sub">Renew Subscription (₹399)</button>
          </div>
        </div>
      </div>

      <div class="card table-wrap">
        <h3 style="margin-bottom:10px;">Payment History</h3>
        <table class="data-table">
          <thead><tr><th>Plan</th><th>Method</th><th>Txn ID</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${state.subscriptionPayments
              .map(
                (p) => `
              <tr>
                <td>${escapeHtml(p.planName)}</td>
                <td>${escapeHtml(p.method)}</td>
                <td class="mono">${escapeHtml(p.transactionId)}</td>
                <td>${formatDate(p.paidAtMillis)}</td>
                <td>₹${p.amountInr}</td>
                <td><span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status)}</span></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderAdminScreen(state) {
  const totalUsers = state.adminUsers.length;
  const active = state.adminUsers.filter((u) => u.planStatus === 'ACTIVE').length;
  const trial = state.adminUsers.filter((u) => u.planStatus === 'TRIAL').length;
  const expired = state.adminUsers.filter((u) => u.planStatus === 'EXPIRED').length;
  const mrr = state.adminUsers.reduce((s, u) => s + u.monthlyRevenueInr, 0);

  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <h2>Admin SaaS Dashboard</h2>
      <div class="grid grid-4">
        ${renderKpiCard({ title: 'Total Users', value: String(totalUsers), subtitle: 'Registered SMBs', icon: 'users', tone: 'info' })}
        ${renderKpiCard({ title: 'Active Subs', value: String(active), subtitle: 'Paid ₹399/mo', icon: 'check-circle', tone: 'success' })}
        ${renderKpiCard({ title: 'Trial Accounts', value: String(trial), subtitle: '14-day trial', icon: 'clock', tone: 'warning' })}
        ${renderKpiCard({ title: 'Monthly Revenue', value: formatInr(mrr), subtitle: `${expired} expired`, icon: 'indian-rupee', tone: 'success' })}
      </div>

      <div class="card table-wrap">
        <h3 style="margin-bottom:10px;">Users & Subscriptions</h3>
        <table class="data-table">
          <thead><tr><th>Business</th><th>Owner</th><th>Email</th><th>Status</th><th>MRR</th><th>Action</th></tr></thead>
          <tbody>
            ${state.adminUsers
              .map(
                (u) => `
              <tr>
                <td><strong>${escapeHtml(u.businessName)}</strong></td>
                <td>${escapeHtml(u.ownerName)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge ${statusBadgeClass(u.planStatus)}">${escapeHtml(u.planStatus)}</span></td>
                <td>₹${u.monthlyRevenueInr}</td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm" data-admin-plan="${u.id}:ACTIVE">Active</button>
                    <button class="btn btn-outline btn-sm" data-admin-plan="${u.id}:EXPIRED">Expire</button>
                  </div>
                </td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <div class="card">
        <h3 style="margin-bottom:8px;">Admin Support Link Settings</h3>
        <form id="admin-whatsapp-form" style="display:flex;gap:10px;flex-wrap:wrap;align-items:end;">
          <div class="field" style="flex:1;margin:0;">
            <label>WhatsApp Support URL (used on Support page)</label>
            <input class="input" name="whatsappUrl" value="${escapeHtml(state.profile.whatsappSupportUrl)}" />
          </div>
          <button class="btn btn-primary" type="submit">Update Link</button>
        </form>
      </div>
    </div>
  `;
}

export function renderSupportScreen(state) {
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <h2>Help Center & Support</h2>
      <div class="card" style="background:var(--primary-soft);border-color:var(--primary-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <h3>Need Instant Help?</h3>
          <p style="font-size:13px;color:var(--text-muted);margin:4px 0 0;">Chat directly with our merchant onboarding team on WhatsApp.</p>
        </div>
        <a class="btn btn-primary" href="${escapeHtml(state.profile.whatsappSupportUrl)}" target="_blank" rel="noopener">
          <i data-lucide="message-circle" style="width:18px;height:18px;"></i> Chat on WhatsApp
        </a>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h3 style="margin-bottom:12px;">Support FAQ</h3>
          <details style="margin-bottom:10px;" open>
            <summary style="font-weight:600;cursor:pointer;">How do I download or print an invoice PDF?</summary>
            <p style="font-size:13px;color:var(--text-muted);">Open any invoice and click Preview / PDF, then choose Print / Save PDF.</p>
          </details>
          <details style="margin-bottom:10px;">
            <summary style="font-weight:600;cursor:pointer;">How do I configure my UPI ID & GSTIN?</summary>
            <p style="font-size:13px;color:var(--text-muted);">Update your details in Settings and click Save Settings.</p>
          </details>
        </div>

        <div class="card">
          <h3 style="margin-bottom:12px;">Submit Feedback / Ticket</h3>
          <form id="support-form">
            <div class="field"><label>Subject</label><input class="input" name="subject" required /></div>
            <div class="field">
              <label>Category</label>
              <select class="select" name="category">
                <option>Billing & GST</option><option>UPI Payments</option><option>Inventory</option><option>Feature Request</option>
              </select>
            </div>
            <div class="field"><label>Message</label><textarea class="textarea" name="message" required></textarea></div>
            <button class="btn btn-primary btn-block" type="submit">Submit Feedback</button>
          </form>
        </div>
      </div>
    </div>
  `;
}
