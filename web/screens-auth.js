import { escapeHtml, renderSvgAreaChart } from './components.js';

export function renderLandingPage(state) {
  const features = [
    ['Smart Billing', 'GST & non-GST invoices with instant PDF & WhatsApp sharing.', 'receipt'],
    ['Customer Management', 'Track customer purchases, khata balances & reminders.', 'users'],
    ['Expense Tracking', 'Categorize rent, electricity, salary & daily shop spends.', 'wallet'],
    ['QR & UPI Records', 'Log UPI, BharatQR, Cash & Bank settlements with UTR IDs.', 'qr-code'],
    ['Inventory Management', 'Live stock quantities, low-stock alerts, Stock In & Out.', 'package'],
    ['Business Reports', 'Sales, Profit, Expense & GST reports with CSV/PDF export.', 'bar-chart-3'],
  ];

  const faqs = [
    ['Can I use it without GST registration?', 'Yes! Toggle GST Registered to No during onboarding to issue clean non-GST bills.'],
    ['How much does Smart Business Toolkit cost?', 'It includes a 14-day free trial, then a flat ₹399/month with unlimited invoices.'],
    ['Can I share invoices on WhatsApp?', 'Yes, generate a formatted Indian PDF invoice and share directly on WhatsApp.'],
    ['Is it ready for desktop and mobile?', 'Yes, it includes a desktop sidebar and mobile bottom navigation + drawer.'],
  ];

  return `
    <div class="landing-nav">
      <div class="landing-wrap" style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;padding-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="brand-logo">₹</div>
          <div>
            <div class="font-display" style="font-weight:800;">Smart Business Toolkit</div>
            <div style="font-size:12px;color:var(--primary);font-weight:600;">₹399/month • आपका छोटा बिजनेस, अब स्मार्ट तरीके से।</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-outline btn-sm" id="btn-toggle-theme">
            <i data-lucide="${state.session.darkMode ? 'sun' : 'moon'}" style="width:16px;height:16px;"></i>
          </button>
          <button class="btn btn-outline btn-sm" data-nav="login">Login</button>
          <button class="btn btn-primary btn-sm" id="btn-start-trial">Start Free Trial</button>
        </div>
      </div>
    </div>

    <section class="hero-section">
      <div class="landing-wrap" style="text-align:center;max-width:780px;">
        <span class="badge badge-success">आपका छोटा बिजनेस, अब स्मार्ट तरीके से।</span>
        <h1 style="font-size:clamp(28px, 5vw, 44px);margin:14px 0 12px;">अपने बिजनेस का पूरा हिसाब, एक ही जगह।</h1>
        <p style="font-size:17px;color:var(--text-muted);margin:0 auto 20px;max-width:620px;">
          Billing, Customers, Expenses, Payments और Stock Management — छोटे बिजनेस के लिए एक स्मार्ट समाधान।
        </p>
        <div style="display:inline-flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);padding:8px 18px;border-radius:14px;margin-bottom:22px;">
          <span style="font-size:13px;color:var(--text-muted);font-weight:600;">All-in-One SaaS</span>
          <strong style="color:var(--primary);font-size:18px;">₹399/month</strong>
        </div>
        <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-hero-trial">
            <i data-lucide="rocket" style="width:18px;height:18px;"></i> Start Free Trial
          </button>
          <button class="btn btn-outline" data-nav="login">Login to Workspace</button>
        </div>
      </div>
    </section>

    <section class="landing-wrap" style="padding-top:42px;padding-bottom:24px;">
      <h2 style="margin-bottom:6px;">Everything Your Business Needs</h2>
      <p style="color:var(--text-muted);margin:0 0 18px;">Built for Indian shopkeepers, retailers, freelancers, and micro-businesses.</p>
      <div class="grid grid-3">
        ${features
          .map(
            ([t, d, ic]) => `
          <div class="card">
            <div style="width:40px;height:40px;border-radius:12px;background:var(--primary-soft);color:var(--primary);display:grid;place-items:center;margin-bottom:10px;">
              <i data-lucide="${ic}" style="width:20px;height:20px;"></i>
            </div>
            <h3 style="font-size:16px;margin-bottom:4px;">${t}</h3>
            <p style="font-size:13px;color:var(--text-muted);margin:0;">${d}</p>
          </div>`
          )
          .join('')}
      </div>
    </section>

    <section class="landing-wrap" style="padding-top:24px;padding-bottom:24px;">
      <h2 style="margin-bottom:16px;">How It Works</h2>
      <div class="grid grid-3">
        <div class="card"><strong>1. Setup in 2 Mins</strong><p style="font-size:13px;color:var(--text-muted);margin:6px 0 0;">Add shop name, GST toggle, UPI ID & logo in 7 quick steps.</p></div>
        <div class="card"><strong>2. Add Items & Buyers</strong><p style="font-size:13px;color:var(--text-muted);margin:6px 0 0;">Maintain SKU stock & customer khata automatically.</p></div>
        <div class="card"><strong>3. Bill & Track Profit</strong><p style="font-size:13px;color:var(--text-muted);margin:6px 0 0;">Send WhatsApp GST bills & monitor daily net profit.</p></div>
      </div>
    </section>

    <section class="landing-wrap" style="padding-top:24px;padding-bottom:24px;">
      <div class="grid grid-2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <div style="font-size:12px;color:var(--text-muted);font-weight:700;">DASHBOARD PREVIEW</div>
              <div class="font-display" style="font-size:24px;font-weight:800;color:var(--primary);">₹1,84,200 / mo</div>
            </div>
            <span class="badge badge-success">+24% Growth</span>
          </div>
          ${renderSvgAreaChart([
            { label: 'Jun', value: 95 },
            { label: 'Jul', value: 118 },
            { label: 'Aug', value: 110 },
            { label: 'Sep', value: 142 },
            { label: 'Oct', value: 165 },
            { label: 'Nov', value: 184 },
          ])}
        </div>
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <div style="font-size:12px;color:var(--text-muted);font-weight:700;">INVOICE PREVIEW</div>
              <strong>Sharma Electronics • INV-2026-1042</strong>
            </div>
            <span class="badge badge-success">PAID • UPI</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px;">
            <span>Havells Ceiling Fan x2</span><strong>₹4,980</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:14px;color:var(--text-muted);">
            <span>CGST 9% + SGST 9%</span><span>₹896</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:12px 0 0;font-size:17px;font-weight:800;color:var(--primary);">
            <span>Grand Total</span><span>₹5,876</span>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-wrap" style="padding-top:24px;padding-bottom:24px;">
      <div class="grid grid-2">
        <div class="card" style="background:var(--primary-soft);border:2px solid var(--primary);">
          <span class="badge badge-success">SMART BUSINESS TOOLKIT PRO</span>
          <div class="font-display" style="font-size:38px;font-weight:800;color:var(--primary);margin:10px 0;">₹399 <span style="font-size:16px;color:var(--text-muted);font-weight:600;">/ month</span></div>
          <ul style="padding-left:18px;margin:0 0 18px;font-size:14px;display:flex;flex-direction:column;gap:6px;">
            <li>Unlimited GST & Non-GST Invoices</li>
            <li>Customer Khata & Pending Reminders</li>
            <li>UPI, QR, Cash & Bank Payment Logs</li>
            <li>Low-Stock Alerts & Inventory Control</li>
            <li>CSV & PDF Business Reports</li>
          </ul>
          <button class="btn btn-primary btn-block" data-nav="register">Start 14-Day Free Trial</button>
        </div>

        <div class="card">
          <h3 style="margin-bottom:12px;">Frequently Asked Questions</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${faqs
              .map(
                ([q, a]) => `
              <details style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;background:var(--bg);">
                <summary style="font-weight:600;font-size:14px;cursor:pointer;">${q}</summary>
                <p style="font-size:13px;color:var(--text-muted);margin:8px 0 0;">${a}</p>
              </details>`
              )
              .join('')}
          </div>
        </div>
      </div>
    </section>

    <section class="landing-wrap" style="padding-top:16px;padding-bottom:40px;">
      <div class="card">
        <h3 style="margin-bottom:6px;">Contact Onboarding Support</h3>
        <p style="font-size:13px;color:var(--text-muted);margin:0 0 14px;">Questions before switching from paper registers? Send us a message.</p>
        <form id="landing-contact-form" class="grid grid-3" style="align-items:end;">
          <div class="field" style="margin:0;"><label>Name</label><input class="input" name="name" required placeholder="Rajesh Sharma" /></div>
          <div class="field" style="margin:0;"><label>Mobile / WhatsApp</label><input class="input" name="phone" required placeholder="+91 98765 43210" /></div>
          <button class="btn btn-primary" type="submit">Request Callback</button>
        </form>
      </div>
    </section>

    <footer style="border-top:1px solid var(--border);background:var(--surface);padding:24px 20px;text-align:center;">
      <strong style="color:var(--primary);">Smart Business Toolkit</strong> • आपका छोटा बिजनेस, अब स्मार्ट तरीके से। • ₹399/month
    </footer>
  `;
}

export function renderLoginPage() {
  return `
    <div style="min-height:100vh;display:grid;place-items:center;padding:20px;">
      <div class="card" style="max-width:440px;width:100%;padding:26px;">
        <button class="btn btn-ghost btn-sm" data-nav="landing" style="margin-bottom:10px;">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back
        </button>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <div class="brand-logo">₹</div>
          <div>
            <h2 style="font-size:20px;">Welcome Back</h2>
            <div style="font-size:12px;color:var(--primary);">Smart Business Toolkit</div>
          </div>
        </div>
        <form id="login-form">
          <div class="field">
            <label>Email Address</label>
            <input class="input" type="email" name="email" value="rajesh@sharmatraders.in" required />
          </div>
          <div class="field">
            <label>Password</label>
            <div style="display:flex;gap:8px;">
              <input class="input" type="password" id="login-password" name="password" value="SmartBiz@2026" required />
              <button type="button" class="btn btn-outline btn-sm" id="btn-toggle-pwd">Show</button>
            </div>
          </div>
          <div style="text-align:right;margin-bottom:14px;">
            <button type="button" class="btn btn-ghost btn-sm" id="btn-forgot-pwd">Forgot password?</button>
          </div>
          <button class="btn btn-primary btn-block" type="submit">Login</button>
        </form>
        <div style="text-align:center;margin-top:14px;font-size:13px;color:var(--text-muted);">
          New here? <button class="btn btn-ghost btn-sm" data-nav="register">Register Free</button>
        </div>
      </div>
    </div>
  `;
}

export function renderRegisterPage() {
  return `
    <div style="min-height:100vh;display:grid;place-items:center;padding:20px;">
      <div class="card" style="max-width:500px;width:100%;padding:26px;">
        <button class="btn btn-ghost btn-sm" data-nav="landing" style="margin-bottom:10px;">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Back
        </button>
        <h2 style="margin-bottom:4px;">Create Business Account</h2>
        <p style="font-size:13px;color:var(--primary);margin:0 0 16px;">14-Day Free Trial • ₹399/month after trial</p>
        <form id="register-form">
          <div class="grid grid-2">
            <div class="field"><label>Full Name</label><input class="input" name="fullName" required /></div>
            <div class="field"><label>Mobile (+91)</label><input class="input" name="mobile" required /></div>
          </div>
          <div class="field"><label>Email</label><input class="input" type="email" name="email" required /></div>
          <div class="grid grid-2">
            <div class="field"><label>Business Name</label><input class="input" name="businessName" required /></div>
            <div class="field">
              <label>Business Type</label>
              <select class="select" name="businessType">
                <option>Retail & Kirana</option>
                <option>Electronics & Hardware</option>
                <option>Freelancer / Services</option>
                <option>Medical & Pharmacy</option>
              </select>
            </div>
          </div>
          <div class="grid grid-2">
            <div class="field"><label>Password</label><input class="input" type="password" name="password" minlength="4" required /></div>
            <div class="field"><label>Confirm Password</label><input class="input" type="password" name="confirmPassword" minlength="4" required /></div>
          </div>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin-bottom:16px;cursor:pointer;">
            <input type="checkbox" name="terms" checked required />
            I accept the Smart Business Toolkit Terms & Privacy Policy.
          </label>
          <button class="btn btn-primary btn-block" type="submit">Create Account</button>
        </form>
      </div>
    </div>
  `;
}

export function renderOnboardingPage(state, step, draft) {
  const pct = Math.round((step / 7) * 100);
  const categories = ['Retail & Kirana', 'Electronics & Hardware', 'Freelancer / Agency', 'Medical & Pharmacy', 'Garments & Boutique', 'Wholesale'];

  let stepHtml = '';
  if (step === 1) {
    stepHtml = `
      <h3>Step 1: Business Name</h3>
      <p style="font-size:13px;color:var(--text-muted);">Shown on your GST invoices and WhatsApp bills.</p>
      <div class="field"><label>Business Name</label><input class="input" id="ob-input-business" value="${escapeHtml(draft.businessName)}" /></div>
    `;
  } else if (step === 2) {
    stepHtml = `
      <h3>Step 2: Business Category</h3>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
        ${categories
          .map(
            (c) => `<button type="button" class="btn btn-sm ${draft.category === c ? 'btn-primary' : 'btn-outline'}" data-ob-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
          )
          .join('')}
      </div>
    `;
  } else if (step === 3) {
    stepHtml = `
      <h3>Step 3: Mobile Number</h3>
      <div class="field"><label>Business Mobile (+91)</label><input class="input" id="ob-input-mobile" value="${escapeHtml(draft.mobile)}" /></div>
    `;
  } else if (step === 4) {
    stepHtml = `
      <h3>Step 4: GST Registered?</h3>
      <label style="display:flex;align-items:center;gap:10px;margin:12px 0;cursor:pointer;">
        <input type="checkbox" id="ob-input-gst-toggle" ${draft.gstRegistered ? 'checked' : ''} />
        <span>Yes, my business is GST registered</span>
      </label>
      ${draft.gstRegistered ? `<div class="field"><label>GSTIN</label><input class="input mono" id="ob-input-gstin" value="${escapeHtml(draft.gstin)}" /></div>` : ''}
    `;
  } else if (step === 5) {
    stepHtml = `
      <h3>Step 5: UPI ID</h3>
      <div class="field"><label>UPI ID for Invoice QR</label><input class="input mono" id="ob-input-upi" value="${escapeHtml(draft.upiId)}" /></div>
    `;
  } else if (step === 6) {
    stepHtml = `
      <h3>Step 6: Business Logo</h3>
      <p style="font-size:13px;color:var(--text-muted);">Upload a shop logo image (optional).</p>
      <input type="file" accept="image/*" id="ob-input-logo" class="input" />
      ${draft.logoDataUrl ? `<img src="${draft.logoDataUrl}" alt="Logo preview" style="width:72px;height:72px;border-radius:14px;object-fit:cover;margin-top:12px;" />` : ''}
    `;
  } else {
    stepHtml = `
      <h3>Step 7: Finish Setup</h3>
      <p style="font-size:13px;color:var(--text-muted);">Review your workspace configuration:</p>
      <div style="font-size:14px;display:flex;flex-direction:column;gap:6px;margin-top:10px;">
        <div><strong>Business:</strong> ${escapeHtml(draft.businessName)}</div>
        <div><strong>Category:</strong> ${escapeHtml(draft.category)}</div>
        <div><strong>Mobile:</strong> ${escapeHtml(draft.mobile)}</div>
        <div><strong>GST:</strong> ${draft.gstRegistered ? escapeHtml(draft.gstin) : 'Non-GST'}</div>
        <div><strong>UPI ID:</strong> <span class="mono">${escapeHtml(draft.upiId)}</span></div>
      </div>
    `;
  }

  return `
    <div style="min-height:100vh;display:grid;place-items:center;padding:20px;">
      <div class="card" style="max-width:520px;width:100%;padding:26px;">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:var(--primary);margin-bottom:6px;">
          <span>Onboarding Step ${step} of 7</span><span>${pct}%</span>
        </div>
        <div style="height:8px;background:var(--surface-subtle);border-radius:999px;overflow:hidden;margin-bottom:18px;">
          <div style="height:100%;width:${pct}%;background:var(--primary);"></div>
        </div>
        ${stepHtml}
        <div style="display:flex;gap:10px;margin-top:18px;">
          ${step > 1 ? `<button class="btn btn-outline" style="flex:1;" id="btn-ob-back">Back</button>` : ''}
          <button class="btn btn-primary" style="flex:1.4;" id="btn-ob-next">${step < 7 ? 'Continue' : 'Finish Setup'}</button>
        </div>
      </div>
    </div>
  `;
}
