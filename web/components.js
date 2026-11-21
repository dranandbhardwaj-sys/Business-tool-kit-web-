import { formatDate, formatInr } from './store.js';

export const NAV_ITEMS = [
  { route: 'dashboard', en: 'Dashboard', hi: 'डैशबोर्ड', icon: 'layout-dashboard', bottom: true },
  { route: 'invoices', en: 'Invoices', hi: 'बिलिंग', icon: 'receipt', bottom: true },
  { route: 'customers', en: 'Customers', hi: 'ग्राहक', icon: 'users', bottom: true },
  { route: 'inventory', en: 'Inventory', hi: 'स्टॉक', icon: 'package', bottom: true },
  { route: 'expenses', en: 'Expenses', hi: 'खर्च', icon: 'wallet', bottom: false },
  { route: 'payments', en: 'Payments', hi: 'पेमेंट', icon: 'indian-rupee', bottom: false },
  { route: 'reports', en: 'Reports', hi: 'रिपोर्ट्स', icon: 'bar-chart-3', bottom: true },
  { route: 'subscription', en: 'Pro ₹399', hi: 'प्लान ₹399', icon: 'crown', bottom: false },
  { route: 'admin', en: 'Admin SaaS', hi: 'एडमिन', icon: 'shield-check', bottom: false },
  { route: 'support', en: 'Support', hi: 'सहायता', icon: 'life-buoy', bottom: false },
  { route: 'settings', en: 'Settings', hi: 'सेटिंग्स', icon: 'settings', bottom: false },
];

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function tr(en, hi, lang) {
  return lang === 'hi' ? hi : en;
}

export function statusBadgeClass(status) {
  const s = String(status || '').toUpperCase();
  if (['PAID', 'ACTIVE', 'RESOLVED', 'SUCCESS', 'IN STOCK'].includes(s)) return 'badge-success';
  if (['PARTIAL', 'TRIAL', 'LOW STOCK'].includes(s)) return 'badge-warning';
  if (['OVERDUE', 'EXPIRED', 'OUT OF STOCK'].includes(s)) return 'badge-danger';
  return 'badge-info';
}

export function renderKpiCard({ title, value, subtitle, icon, tone = 'success', clickAttr = '' }) {
  const colorMap = {
    success: ['var(--primary)', 'var(--primary-soft)'],
    warning: ['var(--warning)', 'var(--warning-soft)'],
    danger: ['var(--danger)', 'var(--danger-soft)'],
    info: ['var(--info)', 'var(--info-soft)'],
  };
  const [fg, bg] = colorMap[tone] || colorMap.success;
  return `
    <div class="card card-hover" ${clickAttr}>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:12px;background:${bg};color:${fg};display:grid;place-items:center;">
          <i data-lucide="${icon}" style="width:20px;height:20px;"></i>
        </div>
      </div>
      <div class="font-display" style="font-size:24px;font-weight:800;">${escapeHtml(value)}</div>
      <div style="font-size:13px;font-weight:600;color:var(--text-muted);margin-top:2px;">${escapeHtml(title)}</div>
      <div style="font-size:12px;color:${fg};margin-top:4px;font-weight:600;">${escapeHtml(subtitle)}</div>
    </div>
  `;
}

export function renderSvgAreaChart(series, color = '#059669') {
  if (!series || series.length === 0) return '';
  const max = Math.max(...series.map((s) => s.value), 1) * 1.15;
  const w = 520;
  const h = 160;
  const padX = 24;
  const padY = 18;
  const stepX = series.length > 1 ? (w - padX * 2) / (series.length - 1) : 0;

  const points = series.map((item, idx) => ({
    x: padX + idx * stepX,
    y: padY + (h - padY * 2) - (item.value / max) * (h - padY * 2),
    ...item,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h - padY} L ${points[0].x.toFixed(1)} ${h - padY} Z`;

  return `
    <div>
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:170px;display:block;">
        <defs>
          <linearGradient id="chartGrad-${color.replace('#', '')}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.28" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="${padX}" y1="${padY}" x2="${w - padX}" y2="${padY}" stroke="var(--border)" stroke-dasharray="4 4" />
        <line x1="${padX}" y1="${h / 2}" x2="${w - padX}" y2="${h / 2}" stroke="var(--border)" stroke-dasharray="4 4" />
        <line x1="${padX}" y1="${h - padY}" x2="${w - padX}" y2="${h - padY}" stroke="var(--border)" />
        <path d="${areaD}" fill="url(#chartGrad-${color.replace('#', '')})" />
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        ${points
          .map(
            (p) => `
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="#fff" stroke="${color}" stroke-width="2.5">
            <title>${escapeHtml(p.label)}: ₹${p.value}K</title>
          </circle>`
          )
          .join('')}
      </svg>
      <div style="display:flex;justify-content:space-between;padding:0 12px;font-size:12px;color:var(--text-muted);font-weight:600;">
        ${series.map((s) => `<span>${escapeHtml(s.label)} (₹${s.value}K)</span>`).join('')}
      </div>
    </div>
  `;
}

export function renderSvgBarChart(series, color = '#D97706') {
  if (!series || series.length === 0) return '';
  const max = Math.max(...series.map((s) => s.value), 1);
  return `
    <div style="display:flex;align-items:flex-end;gap:12px;height:165px;padding-top:16px;">
      ${series
        .map((s) => {
          const pct = Math.max(10, Math.round((s.value / max) * 100));
          return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;gap:6px;">
            <span style="font-size:11px;font-weight:700;color:${color};">₹${s.value}K</span>
            <div style="width:100%;max-width:42px;height:${pct}%;background:${color};border-radius:8px 8px 4px 4px;opacity:0.88;"></div>
            <span style="font-size:12px;color:var(--text-muted);font-weight:600;">${escapeHtml(s.label)}</span>
          </div>`;
        })
        .join('')}
    </div>
  `;
}

export function renderEmptyState(title, subtitle, btnLabel = '', btnAttr = '') {
  return `
    <div class="card" style="text-align:center;padding:36px 20px;">
      <div style="width:52px;height:52px;border-radius:14px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;margin:0 auto 14px;">
        <i data-lucide="folder-open" style="width:26px;height:26px;"></i>
      </div>
      <h3 style="margin-bottom:6px;">${escapeHtml(title)}</h3>
      <p style="color:var(--text-muted);font-size:14px;margin:0 auto 16px;max-width:360px;">${escapeHtml(subtitle)}</p>
      ${btnLabel ? `<button class="btn btn-primary" ${btnAttr}>${escapeHtml(btnLabel)}</button>` : ''}
    </div>
  `;
}

export function renderInvoicePreviewHtml(invoice, profile) {
  return `
    <div id="printable-invoice" style="border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--bg);">
      <div style="background:var(--primary);color:#fff;padding:18px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;">
        <div>
          <h3 style="color:#fff;font-size:18px;">${escapeHtml(profile.businessName)}</h3>
          ${profile.gstRegistered && profile.gstin ? `<div class="mono" style="font-size:12px;opacity:0.9;">GSTIN: ${escapeHtml(profile.gstin)}</div>` : ''}
          <div style="font-size:12px;opacity:0.85;">${escapeHtml(profile.address)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800;font-size:14px;">TAX INVOICE</div>
          <div class="mono" style="font-size:13px;">${escapeHtml(invoice.invoiceNumber)}</div>
          <div style="font-size:12px;opacity:0.85;">${formatDate(invoice.createdAt)}</div>
        </div>
      </div>
      <div style="padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:700;">BILL TO</div>
            <div style="font-weight:700;">${escapeHtml(invoice.customerName)}</div>
            <div style="font-size:13px;color:var(--text-muted);">${escapeHtml(invoice.customerPhone)}</div>
          </div>
          <span class="badge ${statusBadgeClass(invoice.status)}">${escapeHtml(invoice.status)}</span>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Rate</th><th>GST</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${invoice.items
                .map((it) => {
                  const total = it.qty * it.unitPrice * (1 + it.gstPercent / 100);
                  return `<tr>
                    <td>${escapeHtml(it.name)}</td>
                    <td>${it.qty}</td>
                    <td>${formatInr(it.unitPrice)}</td>
                    <td>${it.gstPercent}%</td>
                    <td style="font-weight:700;">${formatInr(total)}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:14px;border-top:1px solid var(--border);padding-top:12px;display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
          <div style="font-size:13px;color:var(--text-muted);">Subtotal: <strong>${formatInr(invoice.subtotal)}</strong></div>
          <div style="font-size:13px;color:var(--text-muted);">Discount: <strong>- ${formatInr(invoice.discountAmount)}</strong></div>
          <div style="font-size:13px;color:var(--text-muted);">GST: <strong>${formatInr(invoice.gstAmount)}</strong></div>
          <div style="font-size:18px;font-weight:800;color:var(--primary);margin-top:4px;">Grand Total: ${formatInr(invoice.totalAmount)}</div>
          <div style="font-size:12px;color:var(--text-muted);">UPI Pay ID: <span class="mono">${escapeHtml(profile.upiId)}</span></div>
        </div>
      </div>
    </div>
  `;
}

export function renderAppShell({ route, state, bodyHtml, drawerOpen }) {
  const lang = state.session.language;
  const activeNav = NAV_ITEMS.find((n) => n.route === route);
  const title = activeNav ? tr(activeNav.en, activeNav.hi, lang) : 'Smart Business';

  const sidebarMenu = `
    <div class="brand-row">
      <div class="brand-logo">₹</div>
      <div style="min-width:0;">
        <div class="font-display" style="font-weight:800;color:var(--primary);font-size:15px;">Smart Business</div>
        <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(state.profile.businessName)}</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;flex:1;">
      ${NAV_ITEMS.map(
        (item) => `
        <button class="nav-item ${item.route === route ? 'active' : ''}" data-nav="${item.route}">
          <i data-lucide="${item.icon}" style="width:18px;height:18px;"></i>
          <span>${escapeHtml(tr(item.en, item.hi, lang))}</span>
        </button>`
      ).join('')}
    </div>
    <div class="card" style="background:var(--primary-soft);border-color:var(--primary-border);margin-top:14px;padding:12px;cursor:pointer;" data-nav="subscription">
      <div style="font-size:12px;font-weight:800;color:var(--primary);">${state.subscription.status === 'ACTIVE' ? 'PRO PLAN ACTIVE' : 'PRO ₹399/month'}</div>
      <div style="font-size:12px;margin-top:4px;">आपका छोटा बिजनेस, अब स्मार्ट तरीके से।</div>
    </div>
  `;

  return `
    <div class="app-shell">
      <aside class="sidebar no-print">${sidebarMenu}</aside>
      <div class="main-area">
        <header class="topbar no-print">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn btn-outline btn-sm mobile-only" id="btn-open-drawer" aria-label="Menu">
              <i data-lucide="menu" style="width:18px;height:18px;"></i>
            </button>
            <div>
              <h2 style="font-size:18px;">${escapeHtml(title)}</h2>
              <div style="font-size:12px;color:var(--text-muted);">${escapeHtml(state.profile.businessName)}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge ${state.subscription.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}" style="cursor:pointer;" data-nav="subscription">
              ${state.subscription.status === 'ACTIVE' ? 'PRO' : `TRIAL ${state.subscription.trialDaysLeft}d`}
            </span>
            <button class="btn btn-outline btn-sm" id="btn-toggle-lang" title="EN / HI">${lang === 'hi' ? 'EN' : 'हिं'}</button>
            <button class="btn btn-outline btn-sm" id="btn-toggle-theme" title="Theme">
              <i data-lucide="${state.session.darkMode ? 'sun' : 'moon'}" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </header>
        <main class="page-body">${bodyHtml}</main>
      </div>
    </div>
    <nav class="bottom-nav no-print">
      ${NAV_ITEMS.filter((i) => i.bottom)
        .map(
          (item) => `
        <button class="bottom-nav-btn ${item.route === route ? 'active' : ''}" data-nav="${item.route}">
          <i data-lucide="${item.icon}" style="width:18px;height:18px;"></i>
          <span>${escapeHtml(tr(item.en, item.hi, lang))}</span>
        </button>`
        )
        .join('')}
    </nav>
    ${
      drawerOpen
        ? `<div class="drawer-backdrop no-print" id="drawer-backdrop">
            <div class="drawer-panel">${sidebarMenu}</div>
          </div>`
        : ''
    }
  `;
}
