import { syncRecordToSupabase, SUPABASE_CONFIG } from './supabase-adapter.js';

const STORAGE_KEY = 'smart_business_toolkit_web_v1';

const now = Date.now();
const day = 86400000;

function createSeedState() {
  return {
    session: {
      isLoggedIn: false,
      isOnboarded: false,
      darkMode: false,
      language: 'en',
      userEmail: 'rajesh@sharmatraders.in',
    },
    profile: {
      ownerName: 'Rajesh Sharma',
      businessName: 'Sharma Electronics & Kirana',
      category: 'Retail & General Store',
      mobile: '+91 98765 43210',
      email: 'rajesh@sharmatraders.in',
      gstRegistered: true,
      gstin: '27AABCS1429B1Z5',
      upiId: 'sharmatraders@okaxis',
      address: 'Shop 14, MG Road, Pune, Maharashtra 411001',
      logoDataUrl: '',
      invoicePrefix: 'INV-2026-',
      currency: 'INR (₹)',
      whatsappSupportUrl: 'https://wa.me/919876543210?text=Hello%20Smart%20Business%20Toolkit%20Support',
    },
    customers: [
      { id: 1, name: 'Ananya Traders', phone: '+91 98201 44512', email: 'accounts@ananyatraders.in', gstin: '27AAACA8891F1Z2', address: 'FC Road, Pune', totalPurchases: 48500, pendingBalance: 6400, lastTransactionAt: now - 3 * 3600000 },
      { id: 2, name: 'Verma Hardware & Electricals', phone: '+91 97650 11234', email: 'verma.hw@gmail.com', gstin: '', address: 'Kothrud, Pune', totalPurchases: 32900, pendingBalance: 0, lastTransactionAt: now - day },
      { id: 3, name: 'Patel Kirana Mart', phone: '+91 99220 88761', email: '', gstin: '', address: 'Baner High Street, Pune', totalPurchases: 21450, pendingBalance: 4250, lastTransactionAt: now - 2 * day },
      { id: 4, name: 'Mehta Interiors', phone: '+91 98111 76230', email: '', gstin: '27AABCM9123H1Z8', address: 'Viman Nagar, Pune', totalPurchases: 64200, pendingBalance: 11800, lastTransactionAt: now - 4 * day },
    ],
    products: [
      { id: 1, name: 'LED Smart Bulb 12W Pack', sku: 'EL-LED-12W', category: 'Lighting', purchasePrice: 320, sellingPrice: 499, stockQty: 48, lowStockThreshold: 12, gstPercent: 18 },
      { id: 2, name: 'Copper Extension Board 6A', sku: 'EL-EXT-06A', category: 'Electricals', purchasePrice: 410, sellingPrice: 650, stockQty: 7, lowStockThreshold: 10, gstPercent: 18 },
      { id: 3, name: 'Havells Ceiling Fan 1200mm', sku: 'AP-FAN-120', category: 'Appliances', purchasePrice: 1850, sellingPrice: 2490, stockQty: 16, lowStockThreshold: 6, gstPercent: 18 },
      { id: 4, name: 'Modular 8-Way Switch Plate', sku: 'EL-SWP-08M', category: 'Switches', purchasePrice: 190, sellingPrice: 310, stockQty: 4, lowStockThreshold: 15, gstPercent: 18 },
      { id: 5, name: 'Wi-Fi Smart Plug 16A', sku: 'SM-PLG-16A', category: 'Smart Home', purchasePrice: 680, sellingPrice: 999, stockQty: 0, lowStockThreshold: 8, gstPercent: 18 },
    ],
    invoices: [
      {
        id: 1, invoiceNumber: 'INV-2026-1042', customerId: 1, customerName: 'Ananya Traders', customerPhone: '+91 98201 44512',
        items: [
          { productId: 1, name: 'LED Smart Bulb 12W Pack', qty: 10, unitPrice: 499, gstPercent: 18 },
          { productId: 3, name: 'Havells Ceiling Fan 1200mm', qty: 2, unitPrice: 2490, gstPercent: 18 },
        ],
        subtotal: 9970, discountAmount: 0, gstAmount: 1794.6, totalAmount: 11764.6, paidAmount: 5364.6,
        status: 'PARTIAL', paymentMethod: 'UPI', notes: 'Balance due in 7 days', createdAt: now - 3 * 3600000,
      },
      {
        id: 2, invoiceNumber: 'INV-2026-1041', customerId: 2, customerName: 'Verma Hardware & Electricals', customerPhone: '+91 97650 11234',
        items: [{ productId: 3, name: 'Havells Ceiling Fan 1200mm', qty: 4, unitPrice: 2490, gstPercent: 18 }],
        subtotal: 9960, discountAmount: 0, gstAmount: 1792.8, totalAmount: 11752.8, paidAmount: 11752.8,
        status: 'PAID', paymentMethod: 'QR', notes: 'Paid via BharatQR', createdAt: now - day,
      },
      {
        id: 3, invoiceNumber: 'INV-2026-1040', customerId: 3, customerName: 'Patel Kirana Mart', customerPhone: '+91 99220 88761',
        items: [{ productId: 4, name: 'Modular 8-Way Switch Plate', qty: 12, unitPrice: 310, gstPercent: 18 }],
        subtotal: 3720, discountAmount: 118, gstAmount: 648, totalAmount: 4250, paidAmount: 0,
        status: 'PENDING', paymentMethod: 'UPI', notes: 'Friday collection', createdAt: now - 2 * day,
      },
      {
        id: 4, invoiceNumber: 'INV-2026-1039', customerId: 4, customerName: 'Mehta Interiors', customerPhone: '+91 98111 76230',
        items: [{ productId: 3, name: 'Havells Ceiling Fan 1200mm', qty: 4, unitPrice: 2490, gstPercent: 18 }],
        subtotal: 9960, discountAmount: 0, gstAmount: 1840, totalAmount: 11800, paidAmount: 0,
        status: 'OVERDUE', paymentMethod: 'BANK', notes: 'Site delivery #2', createdAt: now - 9 * day,
      },
    ],
    expenses: [
      { id: 1, title: 'Shop Electricity Bill', category: 'Electricity', amount: 2450, dateMillis: now - 2 * 3600000, paymentMethod: 'UPI', notes: 'MSEDCL meter' },
      { id: 2, title: 'Shop Monthly Rent', category: 'Rent', amount: 18000, dateMillis: now - 3 * day, paymentMethod: 'BANK', notes: 'November lease' },
      { id: 3, title: 'Tempo Freight & Delivery', category: 'Transport', amount: 1350, dateMillis: now - 4 * day, paymentMethod: 'CASH', notes: 'Wholesale pickup' },
      { id: 4, title: 'Helper Staff Salary', category: 'Salary', amount: 11500, dateMillis: now - 7 * day, paymentMethod: 'UPI', notes: 'Monthly payout' },
    ],
    payments: [
      { id: 1, customerId: 1, customerName: 'Ananya Traders', invoiceId: 1, invoiceNumber: 'INV-2026-1042', amount: 5364.6, method: 'UPI', transactionId: 'UPI43219876012', dateMillis: now - 3 * 3600000, notes: 'Advance via GPay' },
      { id: 2, customerId: 2, customerName: 'Verma Hardware & Electricals', invoiceId: 2, invoiceNumber: 'INV-2026-1041', amount: 11752.8, method: 'QR', transactionId: 'BQR99102348711', dateMillis: now - day, notes: 'BharatQR counter' },
      { id: 3, customerId: 4, customerName: 'Mehta Interiors', invoiceId: null, invoiceNumber: 'INV-2026-1031', amount: 24000, method: 'BANK', transactionId: 'NEFT004819283', dateMillis: now - 12 * day, notes: 'HDFC NEFT' },
    ],
    subscription: {
      planName: 'SMART BUSINESS TOOLKIT PRO',
      priceInr: 399,
      status: 'TRIAL',
      trialDaysLeft: 11,
      expiryDateMillis: now + 11 * day,
    },
    subscriptionPayments: [
      { id: 1, planName: 'SMART BUSINESS TOOLKIT PRO (Trial)', amountInr: 0, transactionId: 'TRIAL-FREE-14D', status: 'SUCCESS', method: '14-Day Free Trial', paidAtMillis: now - 3 * day },
    ],
    adminUsers: [
      { id: 1, ownerName: 'Rajesh Sharma', businessName: 'Sharma Electronics & Kirana', email: 'rajesh@sharmatraders.in', mobile: '+91 98765 43210', planStatus: 'TRIAL', monthlyRevenueInr: 0, joinedAtMillis: now - 3 * day },
      { id: 2, ownerName: 'Priya Deshmukh', businessName: 'Deshmukh Fashion Studio', email: 'priya@deshmukhstudio.in', mobile: '+91 98234 77120', planStatus: 'ACTIVE', monthlyRevenueInr: 399, joinedAtMillis: now - 18 * day },
      { id: 3, ownerName: 'Arvind Gupta', businessName: 'Gupta Medical & General', email: 'arvind@guptamed.in', mobile: '+91 99100 32145', planStatus: 'ACTIVE', monthlyRevenueInr: 399, joinedAtMillis: now - 35 * day },
      { id: 4, ownerName: 'Suresh Yadav', businessName: 'Yadav Dairy & Sweets', email: 'suresh@yadavsweets.in', mobile: '+91 97112 88901', planStatus: 'EXPIRED', monthlyRevenueInr: 0, joinedAtMillis: now - 54 * day },
    ],
    supportTickets: [
      { id: 1, subject: 'Custom GSTIN thermal receipt', category: 'Billing & GST', message: 'Need 80mm thermal print support.', status: 'RESOLVED', createdAtMillis: now - 2 * day },
    ],
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return JSON.parse(raw);
  } catch {
    return createSeedState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage quota errors
  }
}

export function formatInr(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount || 0));
}

export function formatDate(ms) {
  return new Date(ms).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function computeMetrics(state) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = Date.now() - 30 * day;

  const todaysSales = state.invoices
    .filter((i) => i.createdAt >= startOfDay.getTime())
    .reduce((s, i) => s + i.totalAmount, 0);
  const monthlySales = state.invoices
    .filter((i) => i.createdAt >= thirtyDaysAgo)
    .reduce((s, i) => s + i.totalAmount, 0);
  const monthlyExpenses = state.expenses
    .filter((e) => e.dateMillis >= thirtyDaysAgo)
    .reduce((s, e) => s + e.amount, 0);
  const netProfit = monthlySales - monthlyExpenses;
  const pendingPayments = state.customers.reduce((s, c) => s + (c.pendingBalance || 0), 0);
  const totalStockValue = state.products.reduce((s, p) => s + p.stockQty * p.purchasePrice, 0);
  const lowStockCount = state.products.filter((p) => p.stockQty > 0 && p.stockQty <= p.lowStockThreshold).length;
  const outOfStockCount = state.products.filter((p) => p.stockQty <= 0).length;

  return {
    todaysSales,
    monthlySales,
    monthlyExpenses,
    netProfit,
    pendingPayments,
    totalCustomers: state.customers.length,
    totalProducts: state.products.length,
    totalStockValue,
    lowStockCount,
    outOfStockCount,
    salesSeries: [
      { label: 'Jun', value: 38 },
      { label: 'Jul', value: 44 },
      { label: 'Aug', value: 41 },
      { label: 'Sep', value: 52 },
      { label: 'Oct', value: 61 },
      { label: 'Nov', value: Math.max(18, Math.round(monthlySales / 1000)) },
    ],
    expenseSeries: [
      { label: 'Jun', value: 22 },
      { label: 'Jul', value: 25 },
      { label: 'Aug', value: 21 },
      { label: 'Sep', value: 27 },
      { label: 'Oct', value: 30 },
      { label: 'Nov', value: Math.max(10, Math.round(monthlyExpenses / 1000)) },
    ],
  };
}

export async function syncTable(tableKey, payload) {
  return syncRecordToSupabase(SUPABASE_CONFIG.tables[tableKey] || tableKey, payload);
}
