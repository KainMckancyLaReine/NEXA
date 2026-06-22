/* ============================================================
   NEXA — Exact Online live provider (real API, zero-dependency)
   ------------------------------------------------------------
   Implements the finance connector verbs against Exact Online's
   REST API. Activates only when set:
       EXACT_CLIENT_ID, EXACT_CLIENT_SECRET,
       EXACT_REFRESH_TOKEN, EXACT_DIVISION
   Registered in server.js via connectors.registerProvider('exact', ...).

   Exact issues short-lived access tokens AND rotates the refresh
   token on every refresh, so in production you must persist the new
   refresh token returned here. Uses global fetch (Node 18+).

   Region note: defaults to the .nl base; override with EXACT_BASE.
   ============================================================ */

const BASE = process.env.EXACT_BASE || 'https://start.exactonline.nl';
const TOKEN_URL = `${BASE}/api/oauth2/token`;
const DIVISION = () => process.env.EXACT_DIVISION;

let _access = { token: null, exp: 0 };
let _refresh = process.env.EXACT_REFRESH_TOKEN;

async function accessToken() {
  if (_access.token && Date.now() < _access.exp - 60_000) return _access.token;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.EXACT_CLIENT_ID,
    client_secret: process.env.EXACT_CLIENT_SECRET,
    refresh_token: _refresh,
  });
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`exact token ${res.status}: ${await res.text()}`);
  const data = await res.json();
  _access = { token: data.access_token, exp: Date.now() + (data.expires_in || 600) * 1000 };
  if (data.refresh_token) _refresh = data.refresh_token; // Exact rotates it — persist in production
  return _access.token;
}

async function api(pathname, init = {}) {
  const token = await accessToken();
  const res = await fetch(`${BASE}/api/v1/${DIVISION()}${pathname}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, accept: 'application/json', 'content-type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`exact ${pathname} ${res.status}: ${await res.text()}`);
  return res.json();
}

module.exports = {
  /* Outstanding receivables — real overdue list + total. */
  async listOverdue() {
    const today = new Date().toISOString().slice(0, 10);
    const q = `/read/financial/Receivables?$filter=DueDate lt datetime'${today}'&$select=AmountDC,DueDate,InvoiceNumber`;
    const data = await api(q);
    const rows = data?.d?.results || [];
    const total = Math.round(rows.reduce((s, r) => s + (r.AmountDC || 0), 0));
    return { ok: true, mode: 'live', count: rows.length, total, sample: rows.slice(0, 5) };
  },

  /* Creating a real invoice is a side-effect — gated by approval.
     Returns a structured intent rather than silently posting; wire the
     POST to /salesinvoice/SalesInvoices once your invoice template and
     line items are mapped per customer. */
  async createInvoice({ amount } = {}) {
    return { ok: true, mode: 'live', action: 'finance.createInvoice', amount, note: 'invoice posting requires approved line-item mapping' };
  },
};
