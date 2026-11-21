// Supabase Backend Integration Readiness Layer
// Configure SUPABASE_URL and SUPABASE_ANON_KEY when connecting your live Supabase project.

export const SUPABASE_CONFIG = {
  url: '',
  anonKey: '',
  tables: {
    profiles: 'business_profiles',
    customers: 'customers',
    products: 'products',
    invoices: 'invoices',
    expenses: 'expenses',
    payments: 'payments',
    subscriptions: 'subscriptions',
  },
};

export function getSupabaseStatus() {
  const configured = Boolean(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
  return {
    configured,
    label: configured ? 'Supabase Connected' : 'Supabase Ready (LocalStorage Active)',
  };
}

export async function syncRecordToSupabase(table, payload) {
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    return { ok: true, mode: 'local', table, payload };
  }
  const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_CONFIG.anonKey,
      Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Supabase sync error (${response.status})`);
  }
  return { ok: true, mode: 'supabase', table };
}
