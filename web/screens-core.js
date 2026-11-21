import {
  escapeHtml,
  renderEmptyState,
  renderKpiCard,
  renderSvgAreaChart,
  renderSvgBarChart,
  statusBadgeClass,
  tr,
} from './components.js';
import { computeMetrics, formatDate, formatInr } from './store.js';

export function renderDashboardScreen(state, ui) {
  const m = computeMetrics(state);
  const lang = state.session.language;
  const chartTab = ui.dashboardChartTab || 'sales';
  const lowStock = state.products.filter((p) => p.stockQty <= p.lowStockThreshold);
  const pendingInvs = state.invoices.filter((i) => i.status !== 'PAID');

  const chartHtml =
    chartTab === 'expenses'
      ? renderSvgBarChart(m.expenseSeries, '#D97706')
      : chartTab === 'profit'
      ? renderSvgAreaChart(
          m.salesSeries.map((s, idx) => ({ label: s.label, value: Math.max(0, s.value - m.expenseSeries[idx].value) })),
          '#2563EB'
        )
      : renderSvgAreaChart(m.salesSeries, '#059669');

  return `
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div style="display:flex;flex-wrap:wrap;gap:10px;">
        <button class="btn btn-primary" data-nav="new_invoice"><i data-lucide="plus" style="width:16px;height:16px;"></i> ${tr('Create Invoice', 'नया बिल बनाएं', lang)}</button>
        <button class="btn btn-outline" id="qa-add-customer"><i data-lucide="user-plus" style="width:16px;height:16px;"></i> ${tr('Add Customer', 'ग्राहक जोड़ें', lang)}</button>
        <button class="btn btn-outline" id="qa-add-expense"><i data-lucide="wallet" style="width:16px;height:16px;"></i> ${tr('Add Expense', 'खर्च लिखें', lang)}</button>
        <button class="btn btn-outline" id="qa-add-product"><i data-lucide="package-plus" style="width:16px;height:16px;"></i> ${tr('Add Product', 'प्रोडक्ट जोड़ें', lang)}</button>
      </div>

      <div class="grid grid-3">
        ${renderKpiCard({ title: tr("Today's Sales", 'आज की बिक्री', lang), value: formatInr(m.todaysSales), subtitle: `${state.invoices.length} invoices`, icon: 'indian-rupee', tone: 'success', clickAttr: 'data-nav="invoices"' })}
        ${renderKpiCard({ title: tr('Monthly Sales', 'मासिक बिक्री', lang), value: formatInr(m.monthlySales), subtitle: 'Last 30 days', icon: 'trending-up', tone: 'success', clickAttr: 'data-nav="reports"' })}
        ${renderKpiCard({ title: tr('Expenses', 'कुल खर्च', lang), value: formatInr(m.monthlyExpenses), subtitle: `${state.expenses.length} entries`, icon: 'wallet', tone: 'warning', clickAttr: 'data-nav="expenses"' })}
        ${renderKpiCard({ title: tr('Profit', 'शुद्ध मुनाफा', lang), value: formatInr(m.netProfit), subtitle: m.netProfit >= 0 ? 'Healthy margin' : 'Monitor spends', icon: 'sparkles', tone: m.netProfit >= 0 ? 'success' : 'danger', clickAttr: 'data-nav="reports"' })}
        ${renderKpiCard({ title: tr('Pending Payments', 'बकाया उधार', lang), value: formatInr(m.pendingPayments), subtitle: 'Receivable balance', icon: 'clock', tone: 'danger', clickAttr: 'data-nav="payments"' })}
        ${renderKpiCard({ title: tr('Total Customers', 'कुल ग्राहक', lang), value: String(m.totalCustomers), subtitle: 'Active khata', icon: 'users', tone: 'info', clickAttr: 'data-nav="customers"' })}
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div>
            <h3>${tr('Sales, Expenses & Profit Graphs', 'बिजनेस ग्रोथ चार्ट', lang)}</h3>
            <div style="font-size:13px;color:var(--text-muted);">6-month overview (₹ in thousands)</div>
          </div>
          <div style="display:flex;gap:6px;">
            ${['sales', 'expenses', 'profit']
              .map((t) => `<button class="btn btn-sm ${chartTab === t ? 'btn-primary' : 'btn-outline'}" data-dash-chart="${t}">${t.toUpperCase()}</button>`)
              .join('')}
          </div>
        </div>
        ${chartHtml}
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3>Recent Invoices</h3>
            <button class="btn btn-ghost btn-sm" data-nav="invoices">View All</button>
          </div>
          ${state.invoices
            .slice(0, 4)
            .map(
              (inv) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" data-preview-invoice="${inv.id}">
              <div>
                <strong style="font-size:14px;">${escapeHtml(inv.customerName)}</strong>
                <div class="mono" style="font-size:12px;color:var(--text-muted);">${escapeHtml(inv.invoiceNumber)} • ${formatDate(inv.createdAt)}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-weight:700;">${formatInr(inv.totalAmount)}</div>
                <span class="badge ${statusBadgeClass(inv.status)}">${escapeHtml(inv.status)}</span>
              </div>
            </div>`
            )
            .join('')}
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <h3>Recent Transactions</h3>
            <button class="btn btn-ghost btn-sm" data-nav="payments">All Payments</button>
          </div>
          ${state.payments
            .slice(0, 4)
            .map(
              (p) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border);">
              <div>
                <strong style="font-size:14px;">${escapeHtml(p.customerName)}</strong>
                <div class="mono" style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.method)} • ${escapeHtml(p.transactionId)}</div>
              </div>
              <strong style="color:var(--primary);">+ ${formatInr(p.amount)}</strong>
            </div>`
            )
            .join('')}
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3>Low Stock Alerts</h3>
            <button class="btn btn-ghost btn-sm" data-nav="inventory">Inventory</button>
          </div>
          ${lowStock.length === 0 ? '<p style="color:var(--primary);font-size:14px;">All stock healthy.</p>' : lowStock
            .map(
              (p) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
              <div><strong>${escapeHtml(p.name)}</strong><div class="mono" style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.sku)}</div></div>
              <span class="badge ${p.stockQty <= 0 ? 'badge-danger' : 'badge-warning'}">${p.stockQty <= 0 ? 'OUT OF STOCK' : `${p.stockQty} left`}</span>
            </div>`
            )
            .join('')}
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3>Outstanding Payments</h3>
            <button class="btn btn-ghost btn-sm" data-nav="payments">Collect</button>
          </div>
          ${pendingInvs.length === 0 ? '<p style="color:var(--primary);font-size:14px;">No pending invoices!</p>' : pendingInvs
            .map(
              (inv) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
              <div><strong>${escapeHtml(inv.customerName)}</strong><div style="font-size:12px;color:var(--danger);">Due: ${formatInr(inv.totalAmount - inv.paidAmount)}</div></div>
              <button class="btn btn-outline btn-sm" data-mark-paid="${inv.id}">Mark Paid</button>
            </div>`
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderInvoicesScreen(state, ui) {
  const q = (ui.invoiceQuery || '').toLowerCase();
  const f = ui.invoiceFilter || 'ALL';
  const filtered = state.invoices.filter((i) => {
    const matchF = f === 'ALL' || i.status === f;
    const matchQ = !q || i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q);
    return matchF && matchQ;
  });

  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div><h2>Invoices & Billing</h2><div style="font-size:13px;color:var(--text-muted);">${state.invoices.length} invoices recorded</div></div>
        <button class="btn btn-primary" data-nav="new_invoice"><i data-lucide="plus" style="width:16px;height:16px;"></i> New Invoice</button>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
        <input class="input" style="max-width:320px;" id="inv-search" placeholder="Search invoice # or customer..." value="${escapeHtml(ui.invoiceQuery || '')}" />
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${['ALL', 'PAID', 'PARTIAL', 'PENDING', 'OVERDUE']
            .map((s) => `<button class="btn btn-sm ${f === s ? 'btn-primary' : 'btn-outline'}" data-inv-filter="${s}">${s}</button>`)
            .join('')}
        </div>
      </div>
      ${
        filtered.length === 0
          ? renderEmptyState('No matching invoices', 'Create your first GST invoice and share it on WhatsApp.', 'New Invoice', 'data-nav="new_invoice"')
          : `<div class="card table-wrap">
              <table class="data-table">
                <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  ${filtered
                    .map(
                      (inv) => `
                    <tr>
                      <td class="mono" style="font-weight:700;color:var(--primary);">${escapeHtml(inv.invoiceNumber)}</td>
                      <td><strong>${escapeHtml(inv.customerName)}</strong></td>
                      <td>${formatDate(inv.createdAt)}</td>
                      <td style="font-weight:700;">${formatInr(inv.totalAmount)}</td>
                      <td><span class="badge ${statusBadgeClass(inv.status)}">${escapeHtml(inv.status)}</span></td>
                      <td>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                          <button class="btn btn-outline btn-sm" data-preview-invoice="${inv.id}">Preview / PDF</button>
                          ${inv.status !== 'PAID' ? `<button class="btn btn-outline btn-sm" data-mark-paid="${inv.id}">Mark Paid</button>` : ''}
                          <button class="btn btn-ghost btn-sm" data-del-invoice="${inv.id}" style="color:var(--danger);">Delete</button>
                        </div>
                      </td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`
      }
    </div>
  `;
}

export function renderNewInvoiceScreen(state, draft) {
  const subtotal = draft.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const discount = Number(draft.discount || 0);
  const taxable = Math.max(0, subtotal - discount);
  const gst = state.profile.gstRegistered
    ? draft.items.reduce((s, it) => {
        const share = subtotal > 0 ? (it.qty * it.unitPrice) / subtotal : 0;
        return s + taxable * share * (it.gstPercent / 100);
      }, 0)
    : 0;
  const total = taxable + gst;

  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn btn-outline btn-sm" data-nav="invoices"><i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back</button>
        <h2>Create New GST Invoice</h2>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3>1. Customer & Items</h3>
            <button class="btn btn-ghost btn-sm" id="qa-add-customer">+ Add Customer</button>
          </div>
          <div class="field">
            <label>Select Customer</label>
            <select class="select" id="new-inv-customer">
              ${state.customers.map((c) => `<option value="${c.id}" ${Number(draft.customerId) === c.id ? 'selected' : ''}>${escapeHtml(c.name)} (${escapeHtml(c.phone)})</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin:12px 0 8px;">
            <strong style="font-size:13px;">Tap Product to Add</strong>
            <button class="btn btn-ghost btn-sm" id="qa-add-product">+ Add Product</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
            ${state.products.map((p) => `<button type="button" class="btn btn-outline btn-sm" data-add-line-prod="${p.id}">${escapeHtml(p.name)} (${formatInr(p.sellingPrice)})</button>`).join('')}
          </div>
          ${
            draft.items.length === 0
              ? '<p style="font-size:13px;color:var(--text-muted);">No line items added yet.</p>'
              : draft.items
                  .map(
                    (it, idx) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);">
                <div><strong>${escapeHtml(it.name)}</strong><div style="font-size:12px;color:var(--text-muted);">${formatInr(it.unitPrice)} x ${it.qty} (GST ${it.gstPercent}%)</div></div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <button class="btn btn-outline btn-sm" data-line-dec="${idx}">-</button>
                  <strong>${it.qty}</strong>
                  <button class="btn btn-outline btn-sm" data-line-inc="${idx}">+</button>
                  <button class="btn btn-ghost btn-sm" data-line-rm="${idx}" style="color:var(--danger);">×</button>
                </div>
              </div>`
                  )
                  .join('')
          }
        </div>

        <div class="card">
          <h3 style="margin-bottom:12px;">2. Totals & Payment</h3>
          <div class="field"><label>Discount (₹)</label><input class="input" type="number" id="new-inv-discount" value="${draft.discount}" /></div>
          <div class="field">
            <label>Payment Status</label>
            <select class="select" id="new-inv-status">
              <option value="PAID" ${draft.status === 'PAID' ? 'selected' : ''}>PAID (Full)</option>
              <option value="PARTIAL" ${draft.status === 'PARTIAL' ? 'selected' : ''}>PARTIAL</option>
              <option value="PENDING" ${draft.status === 'PENDING' ? 'selected' : ''}>PENDING (Credit)</option>
            </select>
          </div>
          <div class="field">
            <label>Payment Method</label>
            <select class="select" id="new-inv-method">
              ${['UPI', 'QR', 'CASH', 'BANK'].map((m) => `<option ${draft.method === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div style="border-top:1px solid var(--border);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Subtotal</span><strong>${formatInr(subtotal)}</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span>GST Tax</span><strong>${formatInr(gst)}</strong></div>
            <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:var(--primary);"><span>Grand Total</span><span>${formatInr(total)}</span></div>
          </div>
          <button class="btn btn-primary btn-block" style="margin-top:16px;" id="btn-save-invoice">Save Invoice & Preview</button>
        </div>
      </div>
    </div>
  `;
}

export function renderCustomersScreen(state, ui) {
  const q = (ui.customerQuery || '').toLowerCase();
  const filtered = state.customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q));
  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div><h2>Customers & Khata</h2><div style="font-size:13px;color:var(--text-muted);">${state.customers.length} accounts</div></div>
        <button class="btn btn-primary" id="qa-add-customer"><i data-lucide="user-plus" style="width:16px;height:16px;"></i> Add Customer</button>
      </div>
      <input class="input" style="max-width:340px;" id="cust-search" placeholder="Search customer name or phone..." value="${escapeHtml(ui.customerQuery || '')}" />
      ${
        filtered.length === 0
          ? renderEmptyState('No customers found', 'Add buyers to track purchases and pending balances.', 'Add Customer', 'id="qa-add-customer"')
          : `<div class="card table-wrap">
              <table class="data-table">
                <thead><tr><th>Customer</th><th>Phone</th><th>Total Purchases</th><th>Pending</th><th>Last Txn</th><th>Actions</th></tr></thead>
                <tbody>
                  ${filtered
                    .map(
                      (c) => `
                    <tr>
                      <td><strong>${escapeHtml(c.name)}</strong></td>
                      <td>${escapeHtml(c.phone)}</td>
                      <td>${formatInr(c.totalPurchases)}</td>
                      <td><span class="badge ${c.pendingBalance > 0 ? 'badge-danger' : 'badge-success'}">${c.pendingBalance > 0 ? formatInr(c.pendingBalance) : 'Settled'}</span></td>
                      <td>${formatDate(c.lastTransactionAt)}</td>
                      <td>
                        <div style="display:flex;gap:6px;">
                          <button class="btn btn-outline btn-sm" data-cust-detail="${c.id}">Ledger</button>
                          <button class="btn btn-ghost btn-sm" data-del-cust="${c.id}" style="color:var(--danger);">Delete</button>
                        </div>
                      </td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`
      }
    </div>
  `;
}

export function renderExpensesScreen(state, ui) {
  const m = computeMetrics(state);
  const cat = ui.expenseCategory || 'All';
  const filtered = cat === 'All' ? state.expenses : state.expenses.filter((e) => e.category === cat);
  const byCat = state.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const chartData = Object.entries(byCat).map(([label, val]) => ({ label, value: Math.round(val / 1000) || 1 }));

  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <h2>Expense Management</h2>
        <button class="btn btn-primary" id="qa-add-expense"><i data-lucide="plus" style="width:16px;height:16px;"></i> Add Expense</button>
      </div>
      <div class="grid grid-3">
        ${renderKpiCard({ title: "Today's Expenses", value: formatInr(state.expenses.filter((e) => e.dateMillis >= Date.now() - 86400000).reduce((s, e) => s + e.amount, 0)), subtitle: 'Daily spend', icon: 'calendar', tone: 'warning' })}
        ${renderKpiCard({ title: 'Monthly Expenses', value: formatInr(m.monthlyExpenses), subtitle: 'Last 30 days', icon: 'wallet', tone: 'danger' })}
        ${renderKpiCard({ title: 'Total Expenses', value: formatInr(state.expenses.reduce((s, e) => s + e.amount, 0)), subtitle: `${state.expenses.length} entries`, icon: 'receipt', tone: 'info' })}
      </div>
      <div class="card">
        <h3 style="margin-bottom:10px;">Monthly Expense Chart</h3>
        ${renderSvgBarChart(chartData, '#D97706')}
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['All', 'Rent', 'Electricity', 'Salary', 'Transport', 'Inventory', 'Misc'].map((c) => `<button class="btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline'}" data-exp-cat="${c}">${c}</button>`).join('')}
      </div>
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Date</th><th>Method</th><th>Amount</th><th>Action</th></tr></thead>
          <tbody>
            ${filtered
              .map(
                (e) => `
              <tr>
                <td><strong>${escapeHtml(e.title)}</strong><div style="font-size:12px;color:var(--text-muted);">${escapeHtml(e.notes)}</div></td>
                <td><span class="badge badge-warning">${escapeHtml(e.category)}</span></td>
                <td>${formatDate(e.dateMillis)}</td>
                <td>${escapeHtml(e.paymentMethod)}</td>
                <td style="font-weight:700;color:var(--danger);">${formatInr(e.amount)}</td>
                <td><button class="btn btn-ghost btn-sm" data-del-exp="${e.id}" style="color:var(--danger);">Delete</button></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderPaymentsScreen(state, ui) {
  const f = ui.paymentMethod || 'ALL';
  const filtered = f === 'ALL' ? state.payments : state.payments.filter((p) => p.method === f);
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <div><h2>Payments Tracking</h2><div style="font-size:13px;color:var(--primary);">Collected: ${formatInr(state.payments.reduce((s, p) => s + p.amount, 0))}</div></div>
        <button class="btn btn-primary" id="btn-add-payment"><i data-lucide="plus" style="width:16px;height:16px;"></i> Add Payment Record</button>
      </div>
      <div class="card" style="background:var(--primary-soft);border-color:var(--primary-border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <strong>Merchant UPI / BharatQR ID</strong>
          <div class="mono" style="font-size:16px;color:var(--primary);font-weight:700;margin-top:4px;">${escapeHtml(state.profile.upiId)}</div>
        </div>
        <span class="badge badge-success">UPI • QR • CASH • BANK</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['ALL', 'UPI', 'QR', 'CASH', 'BANK'].map((m) => `<button class="btn btn-sm ${f === m ? 'btn-primary' : 'btn-outline'}" data-pay-filter="${m}">${m}</button>`).join('')}
      </div>
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Customer</th><th>Invoice</th><th>Method</th><th>Transaction ID</th><th>Date</th><th>Amount</th></tr></thead>
          <tbody>
            ${filtered
              .map(
                (p) => `
              <tr>
                <td><strong>${escapeHtml(p.customerName)}</strong></td>
                <td class="mono">${escapeHtml(p.invoiceNumber || '—')}</td>
                <td><span class="badge badge-info">${escapeHtml(p.method)}</span></td>
                <td class="mono">${escapeHtml(p.transactionId)}</td>
                <td>${formatDate(p.dateMillis)}</td>
                <td style="font-weight:700;color:var(--primary);">+ ${formatInr(p.amount)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderInventoryScreen(state, ui) {
  const m = computeMetrics(state);
  const q = (ui.invSearch || '').toLowerCase();
  const filtered = state.products.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  return `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
        <h2>Inventory & Stock</h2>
        <button class="btn btn-primary" id="qa-add-product"><i data-lucide="plus" style="width:16px;height:16px;"></i> Add Product</button>
      </div>
      <div class="grid grid-4">
        ${renderKpiCard({ title: 'Total Products', value: String(m.totalProducts), subtitle: 'Active SKUs', icon: 'package', tone: 'success' })}
        ${renderKpiCard({ title: 'Total Stock Value', value: formatInr(m.totalStockValue), subtitle: 'Cost valuation', icon: 'indian-rupee', tone: 'info' })}
        ${renderKpiCard({ title: 'Low Stock', value: String(m.lowStockCount), subtitle: 'Reorder soon', icon: 'alert-triangle', tone: 'warning' })}
        ${renderKpiCard({ title: 'Out of Stock', value: String(m.outOfStockCount), subtitle: 'Restock urgent', icon: 'x-circle', tone: 'danger' })}
      </div>
      <input class="input" style="max-width:340px;" id="prod-search" placeholder="Search product or SKU..." value="${escapeHtml(ui.invSearch || '')}" />
      <div class="card table-wrap">
        <table class="data-table">
          <thead><tr><th>Product</th><th>SKU</th><th>Buy</th><th>Sell</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered
              .map((p) => {
                const st = p.stockQty <= 0 ? 'OUT OF STOCK' : p.stockQty <= p.lowStockThreshold ? 'LOW STOCK' : 'IN STOCK';
                return `
              <tr>
                <td><strong>${escapeHtml(p.name)}</strong><div style="font-size:12px;color:var(--text-muted);">${escapeHtml(p.category)}</div></td>
                <td class="mono">${escapeHtml(p.sku)}</td>
                <td>${formatInr(p.purchasePrice)}</td>
                <td style="font-weight:700;color:var(--primary);">${formatInr(p.sellingPrice)}</td>
                <td><strong>${p.stockQty}</strong></td>
                <td><span class="badge ${statusBadgeClass(st)}">${st}</span></td>
                <td>
                  <div style="display:flex;gap:6px;">
                    <button class="btn btn-outline btn-sm" data-stock-in="${p.id}">+5 In</button>
                    <button class="btn btn-outline btn-sm" data-stock-out="${p.id}">-1 Out</button>
                    <button class="btn btn-ghost btn-sm" data-del-prod="${p.id}" style="color:var(--danger);">Delete</button>
                  </div>
                </td>
              </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
