# Smart Business Toolkit — Standalone Web App

A zero-build, modular **Emerald Green & Slate** SaaS web application for **Smart Business Toolkit** (`₹399/month` — *आपका छोटा बिजनेस, अब स्मार्ट तरीके से।*).

## Quick Start
1. Serve the `web/` folder locally or deploy directly to **Vercel**, **Netlify**, **GitHub Pages**, or **Cloudflare Pages**:
   ```bash
   npx serve web
   ```
   Or open `web/index.html` via any local static server.

## Included Modules
- `index.html` — Entry shell with Google Fonts (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`, `Noto Sans Devanagari`) and Lucide Icons
- `styles.css` — Responsive light/dark design system, desktop sidebar, mobile drawer & bottom navigation, print invoice styling
- `store.js` — Persistent `localStorage` state, Indian Rupee (`₹`) & date formatters, live KPI & chart metrics
- `supabase-adapter.js` — Ready-to-wire Supabase Postgrest integration (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)
- `screens-auth.js`, `screens-core.js`, `screens-ops.js`, `components.js`, `app.js` — All 15 screens (Landing, Login, Register, 7-Step Onboarding, Dashboard, Invoices + PDF/WhatsApp, Customers & Ledger, Expenses, Payments, Inventory, Reports + CSV/PDF, Settings, Subscription `₹399/mo`, Admin SaaS Dashboard, and Support).
