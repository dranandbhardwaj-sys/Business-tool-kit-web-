import {
  escapeHtml,
  renderAppShell,
  renderInvoicePreviewHtml,
} from './components.js';
import {
  renderLandingPage,
  renderLoginPage,
  renderOnboardingPage,
  renderRegisterPage,
} from './screens-auth.js';
import {
  renderCustomersScreen,
  renderDashboardScreen,
  renderExpensesScreen,
  renderInventoryScreen,
  renderInvoicesScreen,
  renderNewInvoiceScreen,
  renderPaymentsScreen,
} from './screens-core.js';
import {
  renderAdminScreen,
  renderReportsScreen,
  renderSettingsScreen,
  renderSubscriptionScreen,
  renderSupportScreen,
} from './screens-ops.js';
import { formatDate, formatInr, loadState, saveState, syncTable } from './store.js';

let state = loadState();
let currentRoute = state.session.isLoggedIn
  ? state.session.isOnboarded
    ? 'dashboard'
    : 'onboarding'
  : 'landing';

let drawerOpen = false;
let onboardingStep = 1;
let onboardingDraft = { ...state.profile };
let newInvoiceDraft = {
  customerId: state.customers[0]?.id || 1,
  items: [],
  discount: 0,
  status: 'PAID',
  method: 'UPI',
};

const ui = {
  dashboardChartTab: 'sales',
  invoiceQuery: '',
  invoiceFilter: 'ALL',
  customerQuery: '',
  expenseCategory: 'All',
  paymentMethod: 'ALL',
  invSearch: '',
  reportTab: 'Sales Report',
  reportPeriod: '30 Days',
};

function applyTheme() {
  document.documentElement.classList.toggle('dark', Boolean(state.session.darkMode));
}

function showToast(msg) {
  const root = document.getElementById('toast-root');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function openModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-backdrop" id="modal-backdrop"><div class="modal-card">${html}</div></div>`;
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

function commit(msg = null) {
  saveState(state);
  render();
  if (msg) showToast(msg);
}

function navigate(route) {
  currentRoute = route;
  drawerOpen = false;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  applyTheme();
  const app = document.getElementById('app');
  if (currentRoute === 'landing') {
    app.innerHTML = renderLandingPage(state);
  } else if (currentRoute === 'login') {
    app.innerHTML = renderLoginPage();
  } else if (currentRoute === 'register') {
    app.innerHTML = renderRegisterPage();
  } else if (currentRoute === 'onboarding') {
    app.innerHTML = renderOnboardingPage(state, onboardingStep, onboardingDraft);
  } else {
    let bodyHtml = '';
    switch (currentRoute) {
      case 'dashboard': bodyHtml = renderDashboardScreen(state, ui); break;
      case 'invoices': bodyHtml = renderInvoicesScreen(state, ui); break;
      case 'new_invoice': bodyHtml = renderNewInvoiceScreen(state, newInvoiceDraft); break;
      case 'customers': bodyHtml = renderCustomersScreen(state, ui); break;
      case 'expenses': bodyHtml = renderExpensesScreen(state, ui); break;
      case 'payments': bodyHtml = renderPaymentsScreen(state, ui); break;
      case 'inventory': bodyHtml = renderInventoryScreen(state, ui); break;
      case 'reports': bodyHtml = renderReportsScreen(state, ui); break;
      case 'settings': bodyHtml = renderSettingsScreen(state); break;
      case 'subscription': bodyHtml = renderSubscriptionScreen(state); break;
      case 'admin': bodyHtml = renderAdminScreen(state); break;
      case 'support': bodyHtml = renderSupportScreen(state); break;
      default: bodyHtml = renderDashboardScreen(state, ui);
    }
    app.innerHTML = renderAppShell({ route: currentRoute, state, bodyHtml, drawerOpen });
  }
  if (window.lucide) window.lucide.createIcons();
}

function openCustomerModal() {
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3>Add Customer</h3>
      <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
    </div>
    <form id="modal-customer-form">
      <div class="field"><label>Customer Name*</label><input class="input" name="name" required /></div>
      <div class="field"><label>Phone*</label><input class="input" name="phone" required /></div>
      <div class="field"><label>GSTIN (optional)</label><input class="input mono" name="gstin" /></div>
      <div class="field"><label>Address</label><input class="input" name="address" /></div>
      <button class="btn btn-primary btn-block" type="submit">Save Customer</button>
    </form>
  `);
}

function openExpenseModal() {
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3>Add Expense</h3>
      <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
    </div>
    <form id="modal-expense-form">
      <div class="field"><label>Title*</label><input class="input" name="title" required /></div>
      <div class="field"><label>Amount (₹)*</label><input class="input" type="number" name="amount" required /></div>
      <div class="field"><label>Category</label>
        <select class="select" name="category"><option>Rent</option><option>Electricity</option><option>Salary</option><option>Transport</option><option>Inventory</option><option>Misc</option></select>
      </div>
      <div class="field"><label>Payment Method</label>
        <select class="select" name="method"><option>UPI</option><option>QR</option><option>CASH</option><option>BANK</option></select>
      </div>
      <div class="field"><label>Notes</label><input class="input" name="notes" /></div>
      <button class="btn btn-primary btn-block" type="submit">Save Expense</button>
    </form>
  `);
}

function openProductModal() {
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3>Add Product</h3>
      <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
    </div>
    <form id="modal-product-form">
      <div class="field"><label>Product Name*</label><input class="input" name="name" required /></div>
      <div class="grid grid-2">
        <div class="field"><label>SKU</label><input class="input mono" name="sku" /></div>
        <div class="field"><label>Category</label><input class="input" name="category" value="General" /></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>Buy Price (₹)</label><input class="input" type="number" name="purchasePrice" required /></div>
        <div class="field"><label>Sell Price (₹)*</label><input class="input" type="number" name="sellingPrice" required /></div>
      </div>
      <div class="grid grid-2">
        <div class="field"><label>Stock Qty</label><input class="input" type="number" name="stockQty" value="10" /></div>
        <div class="field"><label>GST %</label><input class="input" type="number" name="gstPercent" value="18" /></div>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Save Product</button>
    </form>
  `);
}

function openPaymentModal() {
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3>Add Payment Record</h3>
      <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
    </div>
    <form id="modal-payment-form">
      <div class="field"><label>Customer</label>
        <select class="select" name="customerId">${state.customers.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Amount (₹)*</label><input class="input" type="number" name="amount" required /></div>
      <div class="field"><label>Category</label>
        <select class="select" name="method"><option>UPI</option><option>QR</option><option>CASH</option><option>BANK</option></select>
      </div>
      <div class="field"><label>Transaction ID</label><input class="input mono" name="transactionId" placeholder="UPI43210987" /></div>
      <div class="field"><label>Notes</label><input class="input" name="notes" /></div>
      <button class="btn btn-primary btn-block" type="submit">Record Payment</button>
    </form>
  `);
}

function openInvoiceModal(inv) {
  const waText = encodeURIComponent(
    `*${state.profile.businessName}*\nInvoice: *${inv.invoiceNumber}*\nCustomer: ${inv.customerName}\nAmount: *${formatInr(inv.totalAmount)}*\nStatus: ${inv.status}\nUPI: ${state.profile.upiId}`
  );
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3>Indian GST Tax Invoice</h3>
      <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
    </div>
    ${renderInvoicePreviewHtml(inv, state.profile)}
    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
      <button class="btn btn-outline btn-sm" style="flex:1;" onclick="window.print()">Download PDF / Print</button>
      <a class="btn btn-primary btn-sm" style="flex:1;" href="https://wa.me/?text=${waText}" target="_blank" rel="noopener">Share on WhatsApp</a>
    </div>
  `);
}

// Event Delegation
document.addEventListener('click', (e) => {
  const navBtn = e.target.closest('[data-nav]');
  if (navBtn) return navigate(navBtn.getAttribute('data-nav'));

  if (e.target.id === 'btn-open-drawer' || e.target.closest('#btn-open-drawer')) {
    drawerOpen = true;
    return render();
  }
  if (e.target.id === 'drawer-backdrop') {
    drawerOpen = false;
    return render();
  }
  if (e.target.id === 'btn-close-modal' || e.target.id === 'modal-backdrop') {
    return closeModal();
  }

  if (e.target.closest('#btn-toggle-theme')) {
    state.session.darkMode = !state.session.darkMode;
    return commit();
  }
  if (e.target.closest('#btn-toggle-lang')) {
    state.session.language = state.session.language === 'en' ? 'hi' : 'en';
    return commit(state.session.language === 'hi' ? 'भाषा हिन्दी में बदली गई' : 'Switched to English');
  }

  if (e.target.closest('#btn-start-trial') || e.target.closest('#btn-hero-trial')) {
    state.session.isLoggedIn = true;
    state.session.isOnboarded = true;
    currentRoute = 'dashboard';
    return commit('14-Day Pro Free Trial activated!');
  }

  if (e.target.id === 'btn-toggle-pwd') {
    const inp = document.getElementById('login-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    e.target.textContent = inp.type === 'password' ? 'Show' : 'Hide';
  }
  if (e.target.id === 'btn-forgot-pwd') {
    showToast('Password reset link sent to your email.');
  }

  // Onboarding
  const obCat = e.target.closest('[data-ob-cat]');
  if (obCat) {
    onboardingDraft.category = obCat.getAttribute('data-ob-cat');
    return render();
  }
  if (e.target.id === 'btn-ob-back') {
    onboardingStep = Math.max(1, onboardingStep - 1);
    return render();
  }
  if (e.target.id === 'btn-ob-next') {
    if (onboardingStep === 1) onboardingDraft.businessName = document.getElementById('ob-input-business')?.value || onboardingDraft.businessName;
    if (onboardingStep === 3) onboardingDraft.mobile = document.getElementById('ob-input-mobile')?.value || onboardingDraft.mobile;
    if (onboardingStep === 4) {
      onboardingDraft.gstRegistered = Boolean(document.getElementById('ob-input-gst-toggle')?.checked);
      onboardingDraft.gstin = document.getElementById('ob-input-gstin')?.value || '';
    }
    if (onboardingStep === 5) onboardingDraft.upiId = document.getElementById('ob-input-upi')?.value || onboardingDraft.upiId;

    if (onboardingStep < 7) {
      onboardingStep += 1;
      return render();
    } else {
      state.profile = { ...state.profile, ...onboardingDraft };
      state.session.isOnboarded = true;
      currentRoute = 'dashboard';
      syncTable('profiles', state.profile);
      return commit('Setup finished! Welcome to Smart Business Toolkit.');
    }
  }

  // Dashboard & Filters
  const dashChart = e.target.closest('[data-dash-chart]');
  if (dashChart) {
    ui.dashboardChartTab = dashChart.getAttribute('data-dash-chart');
    return render();
  }
  const invFilter = e.target.closest('[data-inv-filter]');
  if (invFilter) { ui.invoiceFilter = invFilter.getAttribute('data-inv-filter'); return render(); }
  const expCat = e.target.closest('[data-exp-cat]');
  if (expCat) { ui.expenseCategory = expCat.getAttribute('data-exp-cat'); return render(); }
  const payFilter = e.target.closest('[data-pay-filter]');
  if (payFilter) { ui.paymentMethod = payFilter.getAttribute('data-pay-filter'); return render(); }
  const repTab = e.target.closest('[data-rep-tab]');
  if (repTab) { ui.reportTab = repTab.getAttribute('data-rep-tab'); return render(); }
  const repPeriod = e.target.closest('[data-rep-period]');
  if (repPeriod) { ui.reportPeriod = repPeriod.getAttribute('data-rep-period'); return render(); }

  // Quick Modals
  if (e.target.closest('#qa-add-customer')) return openCustomerModal();
  if (e.target.closest('#qa-add-expense')) return openExpenseModal();
  if (e.target.closest('#qa-add-product')) return openProductModal();
  if (e.target.closest('#btn-add-payment')) return openPaymentModal();

  // Invoices
  const prevInv = e.target.closest('[data-preview-invoice]');
  if (prevInv) {
    const inv = state.invoices.find((i) => i.id === Number(prevInv.getAttribute('data-preview-invoice')));
    if (inv) openInvoiceModal(inv);
  }
  const markPaid = e.target.closest('[data-mark-paid]');
  if (markPaid) {
    const inv = state.invoices.find((i) => i.id === Number(markPaid.getAttribute('data-mark-paid')));
    if (inv) {
      const rem = Math.max(0, inv.totalAmount - inv.paidAmount);
      inv.paidAmount = inv.totalAmount;
      inv.status = 'PAID';
      const cust = state.customers.find((c) => c.id === inv.customerId);
      if (cust) cust.pendingBalance = Math.max(0, cust.pendingBalance - rem);
      if (rem > 0) {
        state.payments.unshift({
          id: Date.now(), customerId: inv.customerId, customerName: inv.customerName, invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber, amount: rem, method: 'UPI', transactionId: `UPI${String(Date.now()).slice(-7)}`,
          dateMillis: Date.now(), notes: 'Balance settled',
        });
      }
      return commit(`${inv.invoiceNumber} marked PAID`);
    }
  }
  const delInv = e.target.closest('[data-del-invoice]');
  if (delInv) {
    const id = Number(delInv.getAttribute('data-del-invoice'));
    state.invoices = state.invoices.filter((i) => i.id !== id);
    return commit('Invoice deleted');
  }

  // New Invoice Line Items
  const addLineProd = e.target.closest('[data-add-line-prod]');
  if (addLineProd) {
    const pid = Number(addLineProd.getAttribute('data-add-line-prod'));
    const prod = state.products.find((p) => p.id === pid);
    if (prod) {
      const existing = newInvoiceDraft.items.find((x) => x.productId === pid);
      if (existing) existing.qty += 1;
      else newInvoiceDraft.items.push({ productId: prod.id, name: prod.name, qty: 1, unitPrice: prod.sellingPrice, gstPercent: state.profile.gstRegistered ? prod.gstPercent : 0 });
      return render();
    }
  }
  const incLine = e.target.closest('[data-line-inc]');
  if (incLine) { newInvoiceDraft.items[Number(incLine.getAttribute('data-line-inc'))].qty += 1; return render(); }
  const decLine = e.target.closest('[data-line-dec]');
  if (decLine) {
    const it = newInvoiceDraft.items[Number(decLine.getAttribute('data-line-dec'))];
    if (it.qty > 1) it.qty -= 1;
    return render();
  }
  const rmLine = e.target.closest('[data-line-rm]');
  if (rmLine) { newInvoiceDraft.items.splice(Number(rmLine.getAttribute('data-line-rm')), 1); return render(); }

  if (e.target.id === 'btn-save-invoice') {
    if (newInvoiceDraft.items.length === 0) return showToast('Add at least one product first.');
    const cust = state.customers.find((c) => c.id === Number(newInvoiceDraft.customerId)) || state.customers[0];
    const sub = newInvoiceDraft.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const disc = Number(newInvoiceDraft.discount || 0);
    const tax = Math.max(0, sub - disc);
    const gst = state.profile.gstRegistered
      ? newInvoiceDraft.items.reduce((s, it) => s + tax * (sub > 0 ? (it.qty * it.unitPrice) / sub : 0) * (it.gstPercent / 100), 0)
      : 0;
    const total = tax + gst;
    const paid = newInvoiceDraft.status === 'PAID' ? total : newInvoiceDraft.status === 'PARTIAL' ? total / 2 : 0;
    const inv = {
      id: Date.now(),
      invoiceNumber: `${state.profile.invoicePrefix}${1042 + state.invoices.length + 1}`,
      customerId: cust.id, customerName: cust.name, customerPhone: cust.phone,
      items: [...newInvoiceDraft.items], subtotal: sub, discountAmount: disc, gstAmount: gst,
      totalAmount: total, paidAmount: paid, status: newInvoiceDraft.status, paymentMethod: newInvoiceDraft.method,
      notes: '', createdAt: Date.now(),
    };
    state.invoices.unshift(inv);
    cust.totalPurchases += total;
    cust.pendingBalance += Math.max(0, total - paid);
    cust.lastTransactionAt = Date.now();
    newInvoiceDraft.items.forEach((line) => {
      const p = state.products.find((pr) => pr.id === line.productId);
      if (p) p.stockQty = Math.max(0, p.stockQty - line.qty);
    });
    newInvoiceDraft = { customerId: state.customers[0]?.id || 1, items: [], discount: 0, status: 'PAID', method: 'UPI' };
    syncTable('invoices', inv);
    currentRoute = 'invoices';
    commit(`Invoice ${inv.invoiceNumber} created!`);
    return openInvoiceModal(inv);
  }

  // Customer Detail / Delete
  const custDetail = e.target.closest('[data-cust-detail]');
  if (custDetail) {
    const c = state.customers.find((x) => x.id === Number(custDetail.getAttribute('data-cust-detail')));
    if (c) {
      const custInvs = state.invoices.filter((i) => i.customerId === c.id);
      openModal(`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h3>${escapeHtml(c.name)}</h3>
          <button class="btn btn-ghost btn-sm" id="btn-close-modal">✕</button>
        </div>
        <p style="font-size:13px;color:var(--text-muted);">${escapeHtml(c.phone)} • ${escapeHtml(c.address || 'India')}</p>
        <div class="grid grid-2" style="margin:12px 0;">
          <div class="card" style="background:var(--primary-soft);"><strong>Purchases</strong><div>${formatInr(c.totalPurchases)}</div></div>
          <div class="card" style="background:var(--danger-soft);"><strong>Pending</strong><div>${formatInr(c.pendingBalance)}</div></div>
        </div>
        <h4>Invoice History (${custInvs.length})</h4>
        ${custInvs.map((i) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;"><span>${escapeHtml(i.invoiceNumber)}</span><strong>${formatInr(i.totalAmount)} (${i.status})</strong></div>`).join('') || '<p style="font-size:13px;color:var(--text-muted);">No invoices yet.</p>'}
      `);
    }
  }
  const delCust = e.target.closest('[data-del-cust]');
  if (delCust) {
    state.customers = state.customers.filter((c) => c.id !== Number(delCust.getAttribute('data-del-cust')));
    return commit('Customer removed');
  }
  const delExp = e.target.closest('[data-del-exp]');
  if (delExp) {
    state.expenses = state.expenses.filter((x) => x.id !== Number(delExp.getAttribute('data-del-exp')));
    return commit('Expense deleted');
  }

  // Inventory Stock In/Out/Delete
  const stIn = e.target.closest('[data-stock-in]');
  if (stIn) {
    const p = state.products.find((x) => x.id === Number(stIn.getAttribute('data-stock-in')));
    if (p) { p.stockQty += 5; return commit(`${p.name}: +5 Stock In`); }
  }
  const stOut = e.target.closest('[data-stock-out]');
  if (stOut) {
    const p = state.products.find((x) => x.id === Number(stOut.getAttribute('data-stock-out')));
    if (p) { p.stockQty = Math.max(0, p.stockQty - 1); return commit(`${p.name}: -1 Stock Out`); }
  }
  const delProd = e.target.closest('[data-del-prod]');
  if (delProd) {
    state.products = state.products.filter((p) => p.id !== Number(delProd.getAttribute('data-del-prod')));
    return commit('Product deleted');
  }

  // Reports Export CSV / PDF
  if (e.target.closest('#btn-export-csv')) {
    const csv = ['Invoice,Customer,Total,Status', ...state.invoices.map((i) => `"${i.invoiceNumber}","${i.customerName}",${i.totalAmount},"${i.status}"`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'smart_business_report.csv';
    a.click();
    return showToast('CSV report downloaded!');
  }
  if (e.target.closest('#btn-export-pdf')) {
    window.print();
    return showToast('Print / Save PDF dialog opened.');
  }

  // Subscription & Admin & Logout
  if (e.target.id === 'btn-renew-sub') {
    state.subscription.status = 'ACTIVE';
    state.subscription.trialDaysLeft = 0;
    state.subscription.expiryDateMillis = Date.now() + 30 * 86400000;
    state.subscriptionPayments.unshift({
      id: Date.now(), planName: 'SMART BUSINESS TOOLKIT PRO (Monthly)', amountInr: 399,
      transactionId: `SBT-${String(Date.now()).slice(-6)}`, status: 'SUCCESS', method: 'UPI AutoPay', paidAtMillis: Date.now(),
    });
    return commit('Smart Business Toolkit Pro (₹399/mo) activated!');
  }

  const adminPlan = e.target.closest('[data-admin-plan]');
  if (adminPlan) {
    const [idStr, newStatus] = adminPlan.getAttribute('data-admin-plan').split(':');
    const u = state.adminUsers.find((x) => x.id === Number(idStr));
    if (u) {
      u.planStatus = newStatus;
      u.monthlyRevenueInr = newStatus === 'ACTIVE' ? 399 : 0;
      return commit(`${u.businessName} updated to ${newStatus}`);
    }
  }

  if (e.target.id === 'btn-logout') {
    state.session.isLoggedIn = false;
    currentRoute = 'landing';
    return commit('Logged out safely.');
  }
});

// Input listeners
document.addEventListener('input', (e) => {
  if (e.target.id === 'inv-search') { ui.invoiceQuery = e.target.value; render(); }
  if (e.target.id === 'cust-search') { ui.customerQuery = e.target.value; render(); }
  if (e.target.id === 'prod-search') { ui.invSearch = e.target.value; render(); }
  if (e.target.id === 'new-inv-discount') { newInvoiceDraft.discount = Number(e.target.value || 0); render(); }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'new-inv-customer') newInvoiceDraft.customerId = Number(e.target.value);
  if (e.target.id === 'new-inv-status') newInvoiceDraft.status = e.target.value;
  if (e.target.id === 'new-inv-method') newInvoiceDraft.method = e.target.value;
  if (e.target.id === 'ob-input-gst-toggle') { onboardingDraft.gstRegistered = e.target.checked; render(); }
  if (e.target.id === 'ob-input-logo' && e.target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => { onboardingDraft.logoDataUrl = reader.result; render(); };
    reader.readAsDataURL(e.target.files[0]);
  }
});

// Form submissions
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);

  if (e.target.id === 'landing-contact-form') {
    e.target.reset();
    return showToast(`Thanks ${fd.get('name')}! Callback scheduled.`);
  }
  if (e.target.id === 'login-form') {
    state.session.isLoggedIn = true;
    state.session.userEmail = fd.get('email');
    currentRoute = state.session.isOnboarded ? 'dashboard' : 'onboarding';
    return commit(`Welcome back, ${fd.get('email')}`);
  }
  if (e.target.id === 'register-form') {
    if (fd.get('password') !== fd.get('confirmPassword')) return showToast('Passwords do not match.');
    state.session.isLoggedIn = true;
    state.session.isOnboarded = false;
    state.session.userEmail = fd.get('email');
    state.profile.ownerName = fd.get('fullName');
    state.profile.mobile = fd.get('mobile');
    state.profile.email = fd.get('email');
    state.profile.businessName = fd.get('businessName');
    state.profile.category = fd.get('businessType');
    onboardingDraft = { ...state.profile };
    onboardingStep = 1;
    currentRoute = 'onboarding';
    return commit('Account created! Complete 7-step setup.');
  }
  if (e.target.id === 'modal-customer-form') {
    const cust = {
      id: Date.now(), name: fd.get('name'), phone: fd.get('phone'), gstin: fd.get('gstin') || '',
      address: fd.get('address') || '', totalPurchases: 0, pendingBalance: 0, lastTransactionAt: Date.now(),
    };
    state.customers.unshift(cust);
    closeModal();
    syncTable('customers', cust);
    return commit(`Customer "${cust.name}" added`);
  }
  if (e.target.id === 'modal-expense-form') {
    const exp = {
      id: Date.now(), title: fd.get('title'), amount: Number(fd.get('amount')),
      category: fd.get('category'), paymentMethod: fd.get('method'), notes: fd.get('notes') || '', dateMillis: Date.now(),
    };
    state.expenses.unshift(exp);
    closeModal();
    syncTable('expenses', exp);
    return commit(`Expense "${exp.title}" recorded`);
  }
  if (e.target.id === 'modal-product-form') {
    const prod = {
      id: Date.now(), name: fd.get('name'), sku: fd.get('sku') || `SKU-${String(Date.now()).slice(-4)}`,
      category: fd.get('category') || 'General', purchasePrice: Number(fd.get('purchasePrice')),
      sellingPrice: Number(fd.get('sellingPrice')), stockQty: Number(fd.get('stockQty')),
      lowStockThreshold: 10, gstPercent: Number(fd.get('gstPercent')),
    };
    state.products.unshift(prod);
    closeModal();
    syncTable('products', prod);
    return commit(`Product "${prod.name}" added`);
  }
  if (e.target.id === 'modal-payment-form') {
    const cid = Number(fd.get('customerId'));
    const cust = state.customers.find((c) => c.id === cid);
    const amt = Number(fd.get('amount'));
    const pay = {
      id: Date.now(), customerId: cid, customerName: cust?.name || 'Walk-in', invoiceId: null, invoiceNumber: '',
      amount: amt, method: fd.get('method'), transactionId: fd.get('transactionId') || `TXN-${String(Date.now()).slice(-6)}`,
      dateMillis: Date.now(), notes: fd.get('notes') || '',
    };
    state.payments.unshift(pay);
    if (cust) cust.pendingBalance = Math.max(0, cust.pendingBalance - amt);
    closeModal();
    syncTable('payments', pay);
    return commit(`Payment of ${formatInr(amt)} recorded`);
  }
  if (e.target.id === 'settings-form') {
    state.profile.businessName = fd.get('businessName');
    state.profile.gstin = fd.get('gstin');
    state.profile.address = fd.get('address');
    state.profile.mobile = fd.get('mobile');
    state.profile.email = fd.get('email');
    state.profile.upiId = fd.get('upiId');
    state.profile.invoicePrefix = fd.get('invoicePrefix');
    state.profile.currency = fd.get('currency');
    syncTable('profiles', state.profile);
    return commit('Business settings saved!');
  }
  if (e.target.id === 'admin-whatsapp-form') {
    state.profile.whatsappSupportUrl = fd.get('whatsappUrl');
    return commit('WhatsApp support link updated!');
  }
  if (e.target.id === 'support-form') {
    state.supportTickets.unshift({
      id: Date.now(), subject: fd.get('subject'), category: fd.get('category'),
      message: fd.get('message'), status: 'OPEN', createdAtMillis: Date.now(),
    });
    e.target.reset();
    return commit('Support ticket submitted!');
  }
});

render();
